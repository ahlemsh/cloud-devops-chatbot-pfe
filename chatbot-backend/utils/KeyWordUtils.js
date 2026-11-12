const stopword = require('stopword');

// Liste des mots interrogatifs à supprimer
const wordsToRemove = new Set(["quel", "Quel", "quelle", "Quelle", "quels", "Quels", "quelles", "Quelles", "est-ce", "peut-on", "bonjour", "comment", "est", "sont", "donne", "Donne", "Bonjour", ",", "moi", "Cite", "Parle", "de", "Tu", "tu", "me", "peux", "peut", "Peux-tu", "je", "Je", "as", "bonjour,", "Bonjour,"]);

// Fonction pour extraire les mots-clés
const extractKeywords = (text) => {
  // Séparation sur les espaces pour éviter la coupure des mots
  let tokens = text.toLowerCase().trim().split(/\s+/);

  // Suppression des stopwords et des mots inutiles définis dans `wordsToRemove`
  const filteredTokens = stopword.removeStopwords(tokens).filter(token => !wordsToRemove.has(token));

  return filteredTokens;
};

const capitalizeFirstLetter = (text) => {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
};
// Fonction pour s'assurer que "RFC" est toujours en majuscule
const formatRFC = (text) => {
  return text.replace(/\brfc\b/gi, "RFC"); // Remplace "rfc" par "RFC" peu importe la casse
};

const generateSessionName = (messages) => {
  if (!messages.length) return 'New Session'; // Si aucun message

  const firstMessage = messages[0].content.trim().replace(/\?/g, ''); // Prendre uniquement le premier message
  const tokens = extractKeywords(firstMessage);

  if (tokens.length > 0) {
    let title = tokens.join(' '); // Assemble les mots restants
    title = capitalizeFirstLetter(title); // Mettre la première lettre en majuscule

    title = formatRFC(title); // Met "RFC" en majuscule si présent
    return title;
  }

  return 'New Session'; // Fallback si aucun mot-clé pertinent
};

module.exports = { extractKeywords, generateSessionName };