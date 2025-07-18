<template>
  <div class="home-page">
    <div class="welcome-card">
      <h1>Welcome to DXOS</h1>
      <p>Your macOS-style desktop experience</p>
      <div class="feature-grid">
        <div class="feature-item">
          <UIcon name="i-heroicons-rocket-launch" class="feature-icon" />
          <h3>Fast & Modern</h3>
          <p>Built with Nuxt 3 and Vue 3</p>
        </div>
        <div class="feature-item">
          <UIcon name="i-heroicons-device-phone-mobile" class="feature-icon" />
          <h3>Responsive</h3>
          <p>Works on all devices</p>
        </div>
        <div class="feature-item">
          <UIcon name="i-heroicons-paint-brush" class="feature-icon" />
          <h3>Beautiful UI</h3>
          <p>macOS-inspired design</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100%;
  padding: 20px;
}

.welcome-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 100%;
}

.welcome-card h1 {
  color: white;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.welcome-card p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.2rem;
  margin-bottom: 40px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-top: 30px;
}

.feature-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.feature-icon {
  width: 40px;
  height: 40px;
  color: white;
  margin-bottom: 10px;
}

.feature-item h3 {
  color: white;
  font-size: 1.1rem;
  margin-bottom: 8px;
  font-weight: 600;
}

.feature-item p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin: 0;
}
</style> 