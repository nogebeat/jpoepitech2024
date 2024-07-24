require 'rqrcode'
require 'chunky_png'

# Liste des mots pour lesquels générer les QR codes
words = ['WEI', 'HUB', 'CAMPUS', 'CRYPTAGE', 'INTRUSION', 'QUEST', 'JAM', 'JAMES', 'ORACE']

# Chemin vers le dossier où les QR codes seront sauvegardés
output_dir = 'code_qr'

# Vérifier si le dossier existe, sinon le créer
Dir.mkdir(output_dir) unless Dir.exist?(output_dir)

words.each do |word|
  # Générer le QR code
  qr = RQRCode::QRCode.new(word)

  # Convertir le QR code en image PNG
  png = qr.as_png(
    resize_gte_to: false,
    resize_exactly_to: false,
    fill: 'white',
    color: 'black',
    size: 400, # Taille du QR code
    border_modules: 1,
    module_px_size: 0,
    file: nil # Ne pas sauvegarder directement
  )

  # Sauvegarder l'image QR code
  output_file_path = File.join(output_dir, "#{word}_qrcode.png")
  png.save(output_file_path)
end
