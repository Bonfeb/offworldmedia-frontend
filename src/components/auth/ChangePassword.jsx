const ChangePassword = ({ show, handleClose }) => {
  const [values, setValues] = useState({
    old_password: "",
    new_password: "",
  });
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting password change:", values);
    
    if (
      !values.old_password ||
      !values.new_password ||
      !values.confirm_password
    ) {
      setError("Please fill in all fields");
      return;
    }

    if (values.new_password !== values.confirm_password) {
      setError("New passwords don't match");
      return;
    }

    try {
      console.log("Sending request to change password...");
      const response = await API.put(
        "/change-password/",
        {
          old_password: values.old_password,
          new_password: values.new_password,
        },
        { withCredentials: true }
      );

      console.log("Response:", response.data);
      alert("Password changed successfully");
      handleClose();
    } catch (err) {
      console.error("Password change error:", err.response);
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Error changing password";
      setError(errorMsg);
    }
  };

  return (
    <PasswordModal
      show={show}
      handleClose={handleClose}
      title="Change Password"
      onSubmit={handleSubmit}
      fields={[
        { name: "old_password", label: "Old Password", type: "password" },
        { name: "new_password", label: "New Password", type: "password" },
      ]}
      values={values}
      setValues={setValues}
    />
  );
};

export default ChangePassword;
