import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/dashboard-ecommerce-olist/',
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            'orders',
            'customers',
            'products',
            'order_payments',
            'order_items',
            'order_reviews',
          ].map((dataset) => ({
            name: `olist-${dataset}`,
            test: new RegExp(`olist_${dataset}\\.json$`),
          })),
        },
      },
    },
  },
})