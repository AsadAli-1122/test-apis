const validateUserInput = (fname, lname, email, password) => {
    const errors = [];
  
    const nameRegex = /^[A-Za-z]{3,15}$/;
    if (!nameRegex.test(fname)) {
      errors.push('First name must be between 3 and 15 letters.');
    }
    if (!nameRegex.test(lname)) {
      errors.push('Last name must be between 3 and 15 letters.');
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Please provide a valid email address.');
    }
  
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      errors.push('Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, and a number.');
    }
  
    return errors;
  };
  
module.exports = { validateUserInput };