/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: [ // I love ant design but god they're a pain sometimes
        'antd',
        '@ant-design/icons',
        '@ant-design/icons-svg',
        'rc-util',
        'rc-pagination',
        'rc-picker'
    ],
}

module.exports = nextConfig
