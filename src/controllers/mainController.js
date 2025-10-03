const path = require('path');

exports.homePage = (req, res) => {
    // Enviar HTML de home
    res.sendFile(path.join(__dirname, '../../views/index.html'));
};