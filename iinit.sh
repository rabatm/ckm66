#!/bin/bash

# Script pour créer la structure de dossiers React Native
# A exécuter à la racine de votre projet

# Chemin de base (src/)
BASE_DIR="src"

# Fonction pour créer un dossier et afficher un message
create_dir() {
    if [ ! -d "$1" ]; then
        mkdir -p "$1"
        echo "✅ Créé : $1"
    else
        echo "⚠️  Existe déjà : $1"
    fi
}

echo "🚀 Création de la structure de dossiers..."

# Création des dossiers principaux
create_dir "$BASE_DIR/@types"
create_dir "$BASE_DIR/assets"
create_dir "$BASE_DIR/components/ui"
create_dir "$BASE_DIR/components/shared"
create_dir "$BASE_DIR/features/auth"
create_dir "$BASE_DIR/features/schedule"
create_dir "$BASE_DIR/features/profile"
create_dir "$BASE_DIR/features/news"
create_dir "$BASE_DIR/features/contact"
create_dir "$BASE_DIR/lib"
create_dir "$BASE_DIR/hooks"
create_dir "$BASE_DIR/constants"
create_dir "$BASE_DIR/utils"
create_dir "$BASE_DIR/navigation"

# Création de fichiers .gitkeep dans les dossiers vides pour qu'ils soient versionnés
find "$BASE_DIR" -type d -exec touch {}/.gitkeep \;

echo "✅ Structure créée avec succès !"
echo "📁 Vous pouvez maintenant explorer le dossier '$BASE_DIR'"