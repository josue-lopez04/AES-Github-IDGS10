const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcrypt');

router.use(express.json());

// Clave y IV de ejemplo (se regeneran al reiniciar el servidor)
const key = crypto.randomBytes(32); // 256 bits
const iv = crypto.randomBytes(16);  // 128 bits

/* GET home page */
router.get('/', (req, res) => {
  res.render('index', { title: 'Express' });
});

/* AES-256-CBC: encrypt */
router.post('/encrypt', (req, res) => {
  const data = req.body;
  const algorithm = 'aes-256-cbc';
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encryptedData = cipher.update(data.mensaje, 'utf-8', 'hex');
  encryptedData += cipher.final('hex');

  console.log('Mensaje cifrado (hex):', encryptedData);
  res.json({ 'mensaje-cifrado': encryptedData });
});

/* AES-256-CBC: decrypt (espera hex en req.body.mensaje) */
router.post('/decrypt', (req, res) => {
  const { mensaje } = req.body; // hex
  const algorithm = 'aes-256-cbc';
  const decipher = crypto.createDecipheriv(algorithm, key, iv);

  let decryptedData = decipher.update(mensaje, 'hex', 'utf-8');
  decryptedData += decipher.final('utf-8');

  res.json({ 'mensaje-decifrado': decryptedData });
});

/* ECC keys (PEM) */
router.get('/getkeys', (req, res) => {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', {
    namedCurve: 'secp256k1',
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  res.json({
    privateKey, // PEM string
    publicKey,  // PEM string
  });
});

/* ECC sign (sha256) — devuelve firma en hex */
router.post('/sign-ecc', (req, res) => {
  const data = req.body;
  const sign = crypto.createSign('sha256');
  sign.update(data.mensaje);
  sign.end();
  const signature = sign.sign(data.privateKey, 'hex');
  res.json({ signature });
});

/* ECC verify — recibe firma hex */
router.post('/verify-ecc', (req, res) => {
  const data = req.body;
  const verify = crypto.createVerify('sha256');
  verify.update(data.mensaje);
  verify.end();

  const ok = verify.verify(data.publicKey, data.signature, 'hex');
  res.json({ verify: ok });
});

/* RSA ejemplo end-to-end (genera par de llaves por request) */
router.post('/encrypt-decrypt', (req, res) => {
  const data = req.body;

  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  const encryptedData = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    Buffer.from(data.mensaje)
  );

  const decryptedData = crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    encryptedData
  );

  res.json({
    encrypt: encryptedData.toString('base64'),
    decrypt: decryptedData.toString(),
    privateKey,
    publicKey,
  });
});

/* RSA: generar llaves (PEM) */
router.get('/getkeys-rsa', (req, res) => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  res.json({ privateKey, publicKey });
});

/* RSA: encrypt con publicKey (devuelve base64) */
router.post('/encrypt-rsa', (req, res) => {
  const data = req.body;
  const encryptedData = crypto.publicEncrypt(
    {
      key: data.publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    Buffer.from(data.mensaje)
  );
  res.json({ 'mensaje-cifrado': encryptedData.toString('base64') });
});

/* RSA: decrypt con privateKey (recibe base64 en data.encrypt) */
router.post('/decrypt-rsa', (req, res) => {
  const data = req.body;
  const decryptedData = crypto.privateDecrypt(
    {
      key: data.privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    Buffer.from(data.encrypt, 'base64')
  );
  res.json({ mensaje: decryptedData.toString() });
});

/* RSA: firmado (PSS) devuelve base64 */
router.post('/firmado-rsa', (req, res) => {
  const data = req.body;
  const signature = crypto.sign('sha256', Buffer.from(data.mensaje), {
    key: data.privateKey,
    padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
  });
  res.json({ 'mensaje-firmado': signature.toString('base64') });
});

/* RSA: verify (PSS) — recibe base64 en data.signature */
router.post('/verify-rsa', (req, res) => {
  const data = req.body;
  const ok = crypto.verify(
    'sha256',
    Buffer.from(data.mensaje),
    {
      key: data.publicKey,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    },
    Buffer.from(data.signature, 'base64')
  );
  res.json({ verify: ok });
});

/* Hash (sha512) */
router.post('/hash', (req, res) => {
  const data = req.body;
  const h = crypto.createHash('sha512');
  h.update(data.mensaje);
  const hashedData = h.digest('hex');
  res.json({ hash512: hashedData });
});

/* Bcrypt (async con callbacks; maneja errores) */
router.post('/bcrypt', (req, res) => {
  const data = req.body;
  const saltRounds = 12;
  const plainPassword = data.mensaje;

  bcrypt.genSalt(saltRounds, (err, salt) => {
    if (err) {
      console.error('Error salt:', err);
      return res.status(500).json({ error: 'Error generando salt' });
    }
    bcrypt.hash(plainPassword, salt, (err2, hash) => {
      if (err2) {
        console.error('Error hash:', err2);
        return res.status(500).json({ error: 'Error generando hash' });
      }
      res.json({ hash });
    });
  });
});

module.exports = router;
