from flask import Flask, request, jsonify
from flask_cors import CORS
import uuid
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.document_loaders import TextLoader
from langchain.chains import ConversationalRetrievalChain
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains import create_history_aware_retriever
import os
import re
from dotenv import load_dotenv

# --- Prometheus ---
from prometheus_client import Counter, generate_latest, CONTENT_TYPE_LATEST
from prometheus_flask_exporter import PrometheusMetrics

# Load environment variables
load_dotenv()

DEBUG_MODE = os.getenv("FLASK_DEBUG", "false").lower() == "true"

# Set API Keys
os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY")
os.environ["GROQ_API_KEY"] = os.getenv("GROQ_API_KEY")

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False
# CSRF protection not required: this is a stateless API, no user session or cookies used
CORS(app)
metrics = PrometheusMetrics(app)
metrics.info('app_info', 'Modèle IA', version='1.0.0')

# --- Prometheus Counters ---
chat_requests_total = Counter('chat_requests_total', 'Total number of /chat requests')
upload_requests_total = Counter('upload_requests_total', 'Total number of /upload requests')

# LLM and Embeddings
embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
llm = ChatGroq(
    model="llama3-70b-8192",
    temperature=0.5,
    max_tokens=None,
    timeout=None,
    max_retries=2
)
vector_store = None
VECTOR_STORE_PATH = r"vector_store" 

def get_chunks(text):
    """Splits the text into chunks based on titles and content."""
    title_pattern = re.compile(r'(?P<title>\d+\.\s?[A-Za-z\s]+)')
    sections = title_pattern.split(text)
    chunks = []
    if len(sections) < 3:
        return []  # Pas assez de contenu pour chunker
    for i in range(1, len(sections), 2):
        content = sections[i + 1].strip() if i + 1 < len(sections) else ""
        if content:
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200,
                length_function=len
            )
            chunks.extend(text_splitter.split_text(content))
    return chunks

def get_embeddings(chunks):
    """Generates embeddings for the text chunks and saves the vector store."""
    vector_storage = FAISS.from_texts(texts=chunks, embedding=embeddings)
    vector_storage.save_local(VECTOR_STORE_PATH)  # Save vector store to disk
    return vector_storage

def load_vector_store():
    """Loads the vector store from disk if it exists."""
    if os.path.exists(VECTOR_STORE_PATH):
        return FAISS.load_local(
            VECTOR_STORE_PATH, 
            embeddings, 
            allow_dangerous_deserialization=True  # Enable dangerous deserialization
        )
    return None

@app.route('/upload', methods=['POST'])
def upload_text():
    """Uploads and processes a document file to train the model."""
    global vector_store
    upload_requests_total.inc()  # --- Prometheus increment

    # Check if the vector store is already trained
    if vector_store is not None:
        return jsonify({"message": "Model is already trained. No need to upload again."})

    # Load the vector store if it exists
    vector_store = load_vector_store()
    if vector_store is not None:
        return jsonify({"message": "Model already trained and loaded from disk."})

    # Train the model if no vector store exists
    file = request.files['file']
    file_path = os.path.join("uploads", file.filename)

    os.makedirs("uploads", exist_ok=True)
    file.save(file_path)

    loader = TextLoader(file_path)
    docs = loader.load()
    text = ''.join([doc.page_content for doc in docs])
    if not text.strip():
        return jsonify({"error": "Le fichier est vide ou ne contient pas de texte exploitable."}), 400
    chunks = get_chunks(text)
    vector_store = get_embeddings(chunks)
    
    return jsonify({"message": "File uploaded and model trained successfully", "chunks": len(chunks)})

@app.route('/chat', methods=['POST'])
def chat():
    """Handles chat requests using the trained model."""
    global vector_store
    chat_requests_total.inc()  # --- Prometheus increment

    # Get user input
    user_input = request.json.get("input")

    # Validate user input
    if not user_input or not isinstance(user_input, str):
        return jsonify({"error": "Invalid input. Please provide a valid string input."})

    # Ensure UTF-8 encoding for user input
    user_input = user_input.encode("utf-8").decode("utf-8")

    # Load the vector store if it exists
    if vector_store is None:
        vector_store = load_vector_store()

    # Ensure vector store exists
    if vector_store is None:
        return jsonify({"error": "No document uploaded yet. Please upload a document first."})

    try:
        # Create retriever and prompt templates
        retriever = vector_store.as_retriever(k=3)
        system_prompt = (
             "You are an intelligent assistant dedicated to RFC. "
             "Your mission is to provide accurate and relevant support to users asking about RFC, "
             "answering their questions in French and English."
             "Do not explicitly mention that you are referring to a provided text or dataset.\n\n{context}"
        )

        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", system_prompt),
                ("human", "{input}"),
            ]
        )

        # Create chain with history-aware retriever
        contextualize_q_prompt = ChatPromptTemplate.from_messages(
            [
                ("system", system_prompt),
                ("human", "{input}"),
            ]
        )

        history_aware_retriever = create_history_aware_retriever(
            llm, retriever, contextualize_q_prompt
        )

        question_answer_chain = create_stuff_documents_chain(llm, prompt)
        rag_chain = create_retrieval_chain(history_aware_retriever, question_answer_chain)

        # Invoke the chain with the user input
        response = rag_chain.invoke({"input": user_input})

        # Extract the response content from the Document object
        if "answer" in response:
            response_text = response["answer"]
        else:
            response_text = str(response)  # Fallback to string representation

        return jsonify({"response": response_text})

    except Exception as e:
        # Log the error for debugging
        print(f"Error during chat processing: {e}")
        return jsonify({"error": "An error occurred while processing your request. Please try again."})

@app.route('/metrics')
def metrics():
    return generate_latest(), 200, {'Content-Type': CONTENT_TYPE_LATEST}

if __name__ == '__main__':
    app.run(debug=DEBUG_MODE, host='0.0.0.0', port=5000)