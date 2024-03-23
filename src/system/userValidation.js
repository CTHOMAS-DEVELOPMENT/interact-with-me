// userValidation.js

const validateUser = (formData, ignoreValidation=false) => {
    const errors = {};
  
    // Username validation
    if (!formData.username.trim()) {
      errors.username = "Username is required";
    } else if (formData.username.length < 8) {
      errors.username = "Username must be at least 8 characters long";
    }
  
    // Email validation
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!formData.email.match(emailPattern)) {
      errors.email = "Invalid email format";
    }
    if(ignoreValidation) { return errors;}
    // Password validation may be validated at the backend
    if (formData.password.length < 8){
      errors.password = "Password must be at least 8 characters long";
    } else if (!/[A-Z]/.test(formData.password)) {
      errors.password = "Password must contain at least 1 uppercase letter";
    } else if (!/[0-9]/.test(formData.password)) {
      errors.password = "Password must contain at least 1 number";
    }
  
    return errors;
  };
  
  export default validateUser;
  