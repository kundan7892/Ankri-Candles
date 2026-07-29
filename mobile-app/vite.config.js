import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                shop: resolve(__dirname, 'shop.html'),
                pdp: resolve(__dirname, 'pdp.html'),
                builder: resolve(__dirname, 'builder.html')
            }
        }
    }
})
