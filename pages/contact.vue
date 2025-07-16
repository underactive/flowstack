<template>
  <WindowTitleBar 
    title="Contact Us"
    :width="1200"
    :height="900"
    :initial-x="250"
    :initial-y="200"
  >
    <div class="contact-page">
      <div class="contact-container">
        <h1>Contact Us</h1>
        <p class="subtitle">Get in touch with our team</p>
        
        <div class="contact-content">
          <div class="contact-info">
            <h2>Get in Touch</h2>
            <p>We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
            
            <div class="contact-methods">
              <div class="contact-method">
                <UIcon name="i-heroicons-envelope" class="method-icon" />
                <div>
                  <h3>Email</h3>
                  <p>hello@dxos.com</p>
                </div>
              </div>
              
              <div class="contact-method">
                <UIcon name="i-heroicons-phone" class="method-icon" />
                <div>
                  <h3>Phone</h3>
                  <p>+1 (555) 123-4567</p>
                </div>
              </div>
              
              <div class="contact-method">
                <UIcon name="i-heroicons-map-pin" class="method-icon" />
                <div>
                  <h3>Office</h3>
                  <p>123 Innovation Drive<br>Tech City, TC 12345</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="contact-form">
            <h2>Send Message</h2>
            <form @submit.prevent="submitForm">
              <div class="form-group">
                <label for="name">Name</label>
                <input 
                  id="name"
                  v-model="form.name"
                  type="text" 
                  required
                  placeholder="Your name"
                />
              </div>
              
              <div class="form-group">
                <label for="email">Email</label>
                <input 
                  id="email"
                  v-model="form.email"
                  type="email" 
                  required
                  placeholder="your.email@example.com"
                />
              </div>
              
              <div class="form-group">
                <label for="subject">Subject</label>
                <input 
                  id="subject"
                  v-model="form.subject"
                  type="text" 
                  required
                  placeholder="What's this about?"
                />
              </div>
              
              <div class="form-group">
                <label for="message">Message</label>
                <textarea 
                  id="message"
                  v-model="form.message"
                  rows="5"
                  required
                  placeholder="Your message..."
                ></textarea>
              </div>
              
              <button type="submit" class="submit-btn">
                <UIcon name="i-heroicons-paper-airplane" class="btn-icon" />
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </WindowTitleBar>
</template>

<script setup>
const form = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
})

function submitForm() {
  // Here you would typically send the form data to your backend
  console.log('Form submitted:', form.value)
  alert('Thank you for your message! We\'ll get back to you soon.')
  
  // Reset form
  form.value = {
    name: '',
    email: '',
    subject: '',
    message: ''
  }
}
</script>

<style scoped>
.contact-page {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100%;
  padding: 20px;
}

.contact-container {
  max-width: 1200px;
  width: 100%;
}

.contact-container h1 {
  color: white;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.2rem;
  margin-bottom: 40px;
  text-align: center;
}

.contact-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-top: 40px;
}

.contact-info, .contact-form {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 32px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.contact-info h2, .contact-form h2 {
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 16px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.contact-info p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 32px;
}

.contact-methods {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.contact-method {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.method-icon {
  width: 24px;
  height: 24px;
  color: #667eea;
  margin-top: 2px;
}

.contact-method h3 {
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.contact-method p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin: 0;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  color: white;
  font-weight: 500;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  background: rgba(255, 255, 255, 0.15);
}

.submit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-icon {
  width: 16px;
  height: 16px;
}

@media (max-width: 768px) {
  .contact-content {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}
</style> 