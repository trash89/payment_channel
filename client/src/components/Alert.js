const Alert = ({ alertType, alertText }) => {
  return <div className={`alert alert-${alertType}`}>{alertText}</div>;
};

export default Alert;
