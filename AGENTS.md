# Project rules
- Adapt uploaded presentation patches to the existing page implementations while preserving catalog selection, routes and purchase logic; older patches may target superseded layouts.
- Use the shared Logo component for brand wordmarks so header, footer and sign-in branding remain consistent.
- Reset scroll when opening catalog listings, product details or a brand's series so the selected watches appear immediately; keep other routes unchanged.
- Use WatchImage for catalog tiles to normalize plain-background subject bounds without modifying stored photos; fall back to the original image when pixel access is unavailable.