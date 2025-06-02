import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [index("routes/home.tsx"), route("ma-page","routes/ma-page.tsx")] satisfies RouteConfig;
