import fs from 'fs/promises'

import { flowPlugin, esbuildFlowPlugin } from '@bunchtogether/vite-plugin-flow'
import { defineConfig } from 'vitest/config'

// Based on https://github.com/vitejs/vite/discussions/3448#discussioncomment-749919
// and https://github.com/bunchtogether/vite-plugin-flow
export default defineConfig({
    esbuild: {
        loader: 'jsx',
        include: /src\/.*\.jsx?$/,
        // loader: "tsx",
        // include: /src\/.*\.[tj]sx?$/,
        exclude: [],
    },
    optimizeDeps: {
        esbuildOptions: {
            plugins: [
                esbuildFlowPlugin(),
                {
                    name: 'load-js-files-as-jsx',
                    setup(build) {
                        build.onLoad({ filter: /src\/.*\.js$/ }, async (args) => ({
                            loader: 'jsx',
                            contents: await fs.readFile(args.path, 'utf8'),
                        }))
                    },
                },
            ],
        },
    },
    plugins: [flowPlugin()],
    test: {
        environment: 'jsdom',
    },
})
