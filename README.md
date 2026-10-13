# MathSentry

Pixel-faithful native iOS/Android replica of "MathSentry — Analysis Results" screen using Expo SDK 52+ (TypeScript, Expo Router).

## Structure

- `frontend/` - React Native (Expo) app
- `backend/` - Mock Express API
- `design.md`, `tasks.md` - Design and task breakdown

## Frontend

```bash
cd frontend
npm install
npx expo start
```

Exports:
```bash
npx expo export -p ios --output-dir /tmp/dist_ios
npx expo export -p android --output-dir /tmp/dist_android
```

## Backend (mock)

```bash
cd backend
npm install
npm run dev  # starts on port 3000
```

## State

- Phase: 'flaw' | 'scanning' | 'sound'
- fixed, inspectorOpen, hintOpen, shakeKey via Zustand
