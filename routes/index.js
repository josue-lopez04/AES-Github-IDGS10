var express = require('express');
var router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcrypt');

router.use(express.json());
const key = crypto.randomBytes(32); // Genera una clave de 32 bytes (256 bits)
const iv = crypto.randomBytes(16);  // Genera un IV de 16 bytes

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/encrypt', (req, res) => {
  const data  = req.body;
  const algorithm = 'aes-256-cbc';

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encryptedData = cipher.update(data.mensaje, 'utf-8', 'hex');
  encryptedData += cipher.final('hex');

  console.log('Mensaje cifrado (hex):', encryptedData);
  res.json({
    'mensaje-cifrado': encryptedData
  });
});

router.post('/decrypt', (req, res) => {
  const encryptedData = req.body;
  const algorithm = 'aes-256-cbc';
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decryptedData = decipher.update(encryptedData.mensaje, 'hex', 'utf-8');
  decryptedData += decipher.final('utf-8');

  res.json({
    'mensaje-decifrado': decryptedData
  });
});







router.get('/getkeys', (req, res) => {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', {
    namedCurve: 'secp256k1',
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  res.json({
    'privateKey': privateKey.toString('hex'),
    'publicKey': publicKey.toString('hex'),
  });
});

router.post('/sign-ecc', (req, res) => {
  const data  = req.body;
  const sign =  crypto.createSign('sha256');
  sign.write(data.mensaje);
  sign.end();
  var signature = sign.sign(data.privateKey, 'hex');

  res.json({
    'mensaje-cifrado': signature.toString('hex')
  });
});


router.post('/verify-ecc', (req, res) => {
  const data = req.body;

  const verify = crypto.createVerify('sha256');
  verify.write(data.mensaje);
  verify.end();

  res.json({


    'verify': verify.verify(data.publicKey, data.signature, 'hex')
  });
});


router.post('/encrypt-decrypt', (req, res) => {

  const data  = req.body;

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
    'encrypt': encryptedData.toString('base64'),
    'decrypt': decryptedData.toString(),
    'privateKey':privateKey,
    'publicKey':publicKey
  });
});


router.get('/getkeys-rsa', (req, res) => {

  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  res.json({
    'privateKey':privateKey,
    'publicKey':publicKey
  });
});

router.post('/encrypt-rsa', (req, res) => {
  const data  = req.body;

  const encryptedData = crypto.publicEncrypt(
    {
      key: data.publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },

    Buffer.from(data.mensaje)
  );

  res.json({
    'mensaje-cifrado': encryptedData.toString('base64')
  });
});



router.post('/decrypt-rsa', (req, res) => {
  const data = req.body;

  const decryptedData = crypto.publicDecrypt(
    {
      key: data.privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    data.encrypt
  );

  res.json({
    'mensaje': decryptedData.toString()
  });
});


router.post('/firmado-rsa', (req, res) => {
  const data  = req.body;


  const signature = crypto.sign('sha256', Buffer.from(data.mensaje), {
    key: data.privateKey,
    padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
  });

  res.json({
    'mensaje-firmado': signature.toString('base64')
  });
});

router.post('/verify-rsa', (req, res) => {
  const data  = req.body;
  res.json({
    'mensaje-cifrado': crypto.verify(
      'sha256',
      Buffer.from(data.mensaje),
      {
        key: data.publicKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      },
      data.signature
    )
  });
});

router.post('/hash', (req, res) => {
  const data  = req.body;
  const crypto = require('crypto');

  const hash = crypto.createHash('sha512');

  hash.update(data.mensaje);

  const hashedData = hash.digest('hex');
  res.json({
    'hash256': hashedData
  });
});

router.post('/bcrypt', (req, res) => {
  const data  = req.body;


  const saltRounds = 12; // Recommended value between 10 and 12 for security vs. performance

  const plainPassword = data.mensaje;

  bcrypt.genSalt(saltRounds, (err, salt) => {
    if (err) {
      console.error('Error salt:', err);
      return;
    }

    bcrypt.hash(plainPassword, salt, (err, hash) => {
      if (err) {
        console.error('Error:', err);
        return;
      }
      res.json({
        'hash': hash
      });
    });
  });
});


module.exports = router;
