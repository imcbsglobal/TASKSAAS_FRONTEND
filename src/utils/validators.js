/**
 * Validation utilities for punch-in data
 */

/**
 * Validates customer data
 * @param {Object} customer - Customer object to validate
 * @returns {Object} Validation result with isValid and errors
 */
export const validateCustomer = (customer) => {
  const errors = [];
  
  if (!customer) {
    errors.push('Customer is required');
    return { isValid: false, errors };
  }

  if (!customer.id) {
    errors.push('Customer ID is required');
  }

  if (!customer.name && !customer.customerName && !customer.firm_name) {
    errors.push('Customer name is required');
  }

  if (!customer.latitude || !customer.longitude) {
    errors.push('Customer location is required');
  }

  if (customer.latitude && (customer.latitude < -90 || customer.latitude > 90)) {
    errors.push('Invalid latitude');
  }

  if (customer.longitude && (customer.longitude < -180 || customer.longitude > 180)) {
    errors.push('Invalid longitude');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates captured image data
 * @param {Object} image - Image object to validate
 * @returns {Object} Validation result with isValid and errors
 */
export const validateImage = (image) => {
  const errors = [];
  
  if (!image) {
    errors.push('Image is required');
    return { isValid: false, errors };
  }

  if (!image.file) {
    errors.push('Image file is required');
  }

  if (!image.url) {
    errors.push('Image URL is required');
  }

  if (image.file) {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(image.file.type)) {
      errors.push('Invalid image format. Only JPEG, PNG, and WebP are allowed');
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (image.file.size > maxSize) {
      errors.push('Image size too large. Maximum 10MB allowed');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates location data
 * @param {Object} location - Location object to validate
 * @returns {Object} Validation result with isValid and errors
 */
export const validateLocation = (location) => {
  const errors = [];
  
  if (!location) {
    errors.push('Location is required');
    return { isValid: false, errors };
  }

  if (typeof location.latitude !== 'number') {
    errors.push('Valid latitude is required');
  } else if (location.latitude < -90 || location.latitude > 90) {
    errors.push('Latitude must be between -90 and 90');
  }

  if (typeof location.longitude !== 'number') {
    errors.push('Valid longitude is required');
  } else if (location.longitude < -180 || location.longitude > 180) {
    errors.push('Longitude must be between -180 and 180');
  }

  if (location.accuracy && location.accuracy > 100) {
    errors.push('Location accuracy is too low. Please try again');
  }

  // Check if location is too old (more than 5 minutes)
  if (location.timestamp) {
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    if (location.timestamp < fiveMinutesAgo) {
      errors.push('Location data is too old. Please capture location again');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates complete punch-in data
 * @param {Object} data - Complete punch-in data
 * @returns {Object} Validation result with isValid and errors
 */
export const validatePunchInData = (data) => {
  const { customer, image, location } = data;
  const allErrors = [];

  const customerValidation = validateCustomer(customer);
  const imageValidation = validateImage(image);
  const locationValidation = validateLocation(location);

  if (!customerValidation.isValid) {
    allErrors.push(...customerValidation.errors);
  }

  if (!imageValidation.isValid) {
    allErrors.push(...imageValidation.errors);
  }

  if (!locationValidation.isValid) {
    allErrors.push(...locationValidation.errors);
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    validations: {
      customer: customerValidation,
      image: imageValidation,
      location: locationValidation
    }
  };
};
