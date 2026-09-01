🚦 Implementation Order 

Phase 1: Setup (Vite + Tailwind + Dependencies)
Phase 2: Auth (Login/Register pages + Context)
Phase 3: Profile (View + Edit + Picture Upload)
Phase 4: Friends (List + Search + Requests)
Phase 5: Chat (Messages + Send + Edit/Delete)
Phase 6: Socket.IO (Real-time features)
Phase 7: Polish (Responsive + UX improvements)



npm create vite@latest frontend -- --template react
cd frontend
npm install axios formik yup react-toastify react-router-dom socket.io-client react-icons
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
npm run dev

