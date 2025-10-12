// frontend/src/components/Layout.jsx
import React from 'react';
import Navbar from './Navbar'; // <--- IMPORT NAVBAR

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col"> {/* Use flex-col for footer to stick to bottom */}
      <Navbar /> {/* <--- USE NAVBAR */}
      
      <main className="container mx-auto p-4 flex-grow">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="text-center p-4 text-sm text-gray-500 border-t bg-white">
        © {new Date().getFullYear()} Notes Portal | Built with ❤️ by a dedicated student.
      </footer>
    </div>
  );
}

export default Layout;