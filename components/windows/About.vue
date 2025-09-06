<template>
  <div class="about-page">
    <div class="about-card">
      <h1>About AMFM.video</h1>
      <p class="subtitle">A modern web application with a macOS-inspired interface</p>
      
      <div class="content-section">
        <h2>Features</h2>
        <ul class="feature-list">
          <li>macOS-style menu bar with live clock</li>
          <li>Interactive dock with navigation</li>
          <li>Glassmorphism design elements</li>
          <li>Responsive layout</li>
          <li>Built with Nuxt 3 and Vue 3</li>
        </ul>
      </div>

      <div class="content-section">
        <h2>Technology Stack</h2>
        <div class="tech-grid">
          <div class="tech-item">
            <UIcon name="i-logos-nuxt-icon" class="tech-icon" />
            <span>Nuxt 3</span>
          </div>
          <div class="tech-item">
            <UIcon name="i-logos-vue" class="tech-icon" />
            <span>Vue 3</span>
          </div>
          <div class="tech-item">
            <UIcon name="i-logos-typescript-icon" class="tech-icon" />
            <span>TypeScript</span>
          </div>
          <div class="tech-item">
            <UIcon name="i-logos-tailwindcss-icon" class="tech-icon" />
            <span>Tailwind CSS</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-page {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100%;
  padding: 40px 20px 20px 20px;
}

.about-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 40px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 800px;
  width: 100%;
}

.about-card h1 {
  color: white;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.2rem;
  margin-bottom: 40px;
}

.content-section {
  margin-bottom: 40px;
}

.content-section h2 {
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 20px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.feature-list {
  list-style: none;
  padding: 0;
}

.feature-list li {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  margin-bottom: 12px;
  padding-left: 20px;
  position: relative;
}

.feature-list li::before {
  content: "•";
  color: #667eea;
  font-weight: bold;
  position: absolute;
  left: 0;
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 20px;
}

.tech-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.2s ease;
}

.tech-item:hover {
  transform: translateY(-2px);
}

.tech-icon {
  width: 40px;
  height: 40px;
  margin-bottom: 10px;
}

.tech-item span {
  color: white;
  font-weight: 500;
  font-size: 0.9rem;
}
</style> 