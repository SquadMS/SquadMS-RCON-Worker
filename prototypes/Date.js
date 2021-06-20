/* https://stackoverflow.com/questions/8083410/how-can-i-set-the-default-timezone-in-node-js */
Date.prototype.toIsoString = function() {
    const tzo = - this.getTimezoneOffset();
    const dif = tzo >= 0 ? '+' : '-';
    
    const pad = function(num, digits = 2) {       
        const norm = Math.floor(Math.abs(num)).toString();
        return norm.padStart(digits, '0');
    };
    
    return this.getFullYear() +
        '-' + pad(this.getMonth() + 1) +
        '-' + pad(this.getDate()) +
        'T' + pad(this.getHours()) +
        ':' + pad(this.getMinutes()) +
        ':' + pad(this.getSeconds()) +
        '.' + pad(this.getMilliseconds(), 3) +
        dif + pad(tzo / 60) +
        ':' + pad(tzo % 60);
}
