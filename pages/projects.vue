<template>
  <div class="projects-page">
    <div class="projects-container">
      <h1>Projects</h1>
      <p class="subtitle">Explore our latest work and innovations</p>
      
      <div class="projects-grid">
        <div 
          v-for="(project, index) in projects" 
          :key="index"
          class="project-card"
        >
          <div class="project-icon">
            <UIcon :name="project.icon" class="icon" />
          </div>
          <h3>{{ project.title }}</h3>
          <p>{{ project.description }}</p>
          <div class="project-tags">
            <span 
              v-for="tag in project.tags" 
              :key="tag"
              class="tag"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const projects = [
  {
    title: 'DXOS Desktop',
    description: 'A macOS-inspired web desktop interface built with Nuxt 3 and Vue 3.',
    icon: 'i-heroicons-computer-desktop',
    tags: ['Nuxt 3', 'Vue 3', 'TypeScript', 'Tailwind']
  },
  {
    title: 'Smart Dashboard',
    description: 'Real-time analytics dashboard with interactive charts and data visualization.',
    icon: 'i-heroicons-chart-bar',
    tags: ['React', 'D3.js', 'WebSocket', 'Node.js']
  },
  {
    title: 'E-commerce Platform',
    description: 'Full-stack e-commerce solution with payment processing and inventory management.',
    icon: 'i-heroicons-shopping-cart',
    tags: ['Next.js', 'Stripe', 'PostgreSQL', 'Redis']
  },
  {
    title: 'Mobile App',
    description: 'Cross-platform mobile application for task management and productivity.',
    icon: 'i-heroicons-device-phone-mobile',
    tags: ['React Native', 'Expo', 'Firebase', 'Redux']
  },
  {
    title: 'API Gateway',
    description: 'Microservices API gateway with authentication, rate limiting, and monitoring.',
    icon: 'i-heroicons-server',
    tags: ['Node.js', 'Express', 'JWT', 'Redis']
  },
  {
    title: 'Design System',
    description: 'Comprehensive design system with reusable components and documentation.',
    icon: 'i-heroicons-paint-brush',
    tags: ['Storybook', 'Figma', 'CSS', 'JavaScript']
  }
]
</script>

<style scoped>
.projects-page {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100%;
  padding: 40px;
}

.projects-container {
  max-width: 1200px;
  width: 100%;
}

.projects-container h1 {
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

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
}

.project-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.project-icon {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.icon {
  width: 32px;
  height: 32px;
  color: white;
}

.project-card h3 {
  color: white;
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 12px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.project-card p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 16px;
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  background: rgba(102, 126, 234, 0.3);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid rgba(102, 126, 234, 0.5);
}
</style> 