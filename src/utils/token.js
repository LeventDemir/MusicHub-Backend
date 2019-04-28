module.exports = genToken = (length) => {
    const letters = [...Array(52).keys()].map(i =>
      i > 25 ? String.fromCharCode(i + 71) : String.fromCharCode(i + 65)
    );
    
    let token = "";
    
    for (let x = 0; x < length; x++) {
      token += letters[Math.floor(Math.random() * letters.length)];
    }
  
    return token;
}