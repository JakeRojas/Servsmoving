export const CONTACT_INFO = {
    phone: import.meta.env.PUBLIC_PHONE_NUMBER || '0907-888-0557',
    phoneRaw: import.meta.env.PUBLIC_PHONE_RAW || '09078880557',
    email: import.meta.env.PUBLIC_CONTACT_EMAIL || 'jakeianrojas@gmail.com',
    formSubmitUrl: import.meta.env.PUBLIC_FORMSUBMIT_URL || 'https://formsubmit.co/jakeianrojas@gmail.com',
    formSubject: import.meta.env.PUBLIC_FORMSUBMIT_REQUEST || "New Moving Quote Request",
    formFeedback: import.meta.env.PUBLIC_FORMSUBMIT_FEEDBACK || "New Customer's Feedback",
};

export const ADMIN_CONFIG = {
    // Only available on the server
    password: import.meta.env.ADMIN_PASSWORD,
};
