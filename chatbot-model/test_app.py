import os
import warnings
import pytest
from app import app, vector_store

warnings.filterwarnings("ignore", category=DeprecationWarning)

# Répertoire temporaire pour vector store
TEST_VECTOR_STORE_PATH = "test_faiss_store"

@pytest.fixture(autouse=True)
def setup_and_teardown():
    app.config['TESTING'] = True
    app.config['UPLOAD_FOLDER'] = "uploads"

    # Réinitialiser le vector_store global
    global vector_store
    vector_store = None

    # Ne pas supprimer de fichiers, juste simuler
    yield

    # Fin de test – ne rien supprimer


@pytest.fixture
def client():
    return app.test_client()


def create_test_file(tmp_path, name="rfc.txt", content="1. Présentation de RFC\nRFC est une entreprise innovante."):
    uploads_path = tmp_path / "uploads"
    uploads_path.mkdir(exist_ok=True)
    file_path = uploads_path / name
    file_path.write_text(content, encoding="utf-8")
    return file_path


def test_upload_text(client, tmp_path):
    file_path = create_test_file(tmp_path)
    with open(file_path, "rb") as file:
        res = client.post('/upload', data={'file': file}, content_type='multipart/form-data')
    assert res.status_code == 200
    assert "message" in res.json
    if "chunks" in res.json:
        assert res.json["chunks"] > 0


def test_chat_after_training(client, tmp_path):
    file_path = create_test_file(tmp_path)
    with open(file_path, "rb") as file:
        client.post('/upload', data={'file': file}, content_type='multipart/form-data')

    res = client.post('/chat', json={"input": "Peux-tu me parler de RFC ?"})
    assert res.status_code == 200
    assert "response" in res.json


def test_chat_varied_questions(client, tmp_path):
    file_path = create_test_file(tmp_path)
    with open(file_path, "rb") as file:
        client.post('/upload', data={'file': file}, content_type='multipart/form-data')

    questions = [
        "Quels sont les services offerts par RFC ?",
        "Parle-moi de l'histoire de RFC.",
        "Quels sont les domaines d'expertise de RFC ?"
    ]

    for question in questions:
        res = client.post('/chat', json={"input": question})
        assert res.status_code == 200
        assert "response" in res.json


def test_upload_without_file(client):
    res = client.post('/upload')
    assert res.status_code == 200
    assert "message" in res.json or "error" in res.json


def test_chat_with_missing_input(client):
    res = client.post('/chat', json={})
    assert res.status_code == 200
    assert "error" in res.json


def test_chat_without_training(client, tmp_path):
    import app
    app.vector_store = None

    # ⚠️ Répertoire factice temporaire sans vector store
    app.VECTOR_STORE_PATH = str(tmp_path / "no_store")  # Chemin inexistant
    assert not os.path.exists(app.VECTOR_STORE_PATH)

    res = client.post('/chat', json={"input": "Bonjour"})
    assert res.status_code == 200
    assert "error" in res.json


def test_upload_empty_file(client, tmp_path):
    file_path = create_test_file(tmp_path, content="")  # fichier vide
    with open(file_path, "rb") as file:
        res = client.post('/upload', data={'file': file}, content_type='multipart/form-data')
    assert res.status_code == 400
    assert "error" in res.json  # ✔️ l'API retourne {"error": "..."} et non {"message": "..."}
