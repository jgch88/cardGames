/** @jsx h */
const { h, render, Component } = preact;
const { ToastContainer, toast } = require('react-toastify');

const ErrorToastContainer = function ErrorToastContainer(props) {
  return (
    <ToastContainer
      position="bottom-right"
      autoClose={3000}
      hideProgressBar
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnVisibilityChange
      pauseOnHover
    />
  )
}

module.exports = ErrorToastContainer;
