const ChangePassword = ({ show, handleClose }) => {
    const [values, setValues] = useState({
      old_password: "",
      new_password: "",
    });
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await axios.post("/change-password/", values, { withCredentials: true });
        alert("Password changed successfully");
        handleClose();
      } catch (err) {
        alert("Error changing password");
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
  