import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Previne URLs duplicadas ou com prefixo /nutre no subdomínio (ex: nutre.camini.dev.br/nutre -> /)
      {
        source: "/nutre",
        has: [
          {
            type: "host",
            value: "^nutre\\.camini\\.dev\\.br(:\\d+)?$",
          },
        ],
        destination: "/",
        permanent: false,
      },
      {
        source: "/nutre/:path*",
        has: [
          {
            type: "host",
            value: "^nutre\\.camini\\.dev\\.br(:\\d+)?$",
          },
        ],
        destination: "/:path*",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        // Roteamento inteligente para o subdomínio exclusivo nutre.camini.dev.br
        {
          source: "/",
          has: [
            {
              type: "host",
              value: "^nutre\\.camini\\.dev\\.br(:\\d+)?$",
            },
          ],
          destination: "/nutre",
        },
        {
          source: "/pacientes",
          has: [
            {
              type: "host",
              value: "^nutre\\.camini\\.dev\\.br(:\\d+)?$",
            },
          ],
          destination: "/nutre/pacientes",
        },
        {
          source: "/pacientes/:path*",
          has: [
            {
              type: "host",
              value: "^nutre\\.camini\\.dev\\.br(:\\d+)?$",
            },
          ],
          destination: "/nutre/pacientes/:path*",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
