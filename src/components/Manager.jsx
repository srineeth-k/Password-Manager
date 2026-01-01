import React from 'react';
import { useRef, useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import 'react-toastify/dist/ReactToastify.css';

const Manager = () => {
  const passwordRef = useRef();
  const [form, setform] = useState({ site: "", username: "", password: "" });
  const [passwordArray, setPasswordArray] = useState([]);

  // Fetch passwords from backend
  const getPasswords = async () => {
    let req = await fetch("http://localhost:3000/");
    let passwords = await req.json();
    setPasswordArray(passwords);
  };

  useEffect(() => {
    getPasswords();
  }, []);

  // Copy text to clipboard
  const copyText = (text) => {
    toast('Copied to clipboard!', {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
    navigator.clipboard.writeText(text);
  };

  // Save password
  const savePassword = async () => {
    if (form.site.length > 3 && form.username.length > 3 && form.password.length > 3) {

      // Delete existing password if id exists
      if(form.id) {
        await fetch("http://localhost:3000/", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: form.id })
        });
      }

      const newPassword = { ...form, id: uuidv4() };
      setPasswordArray([...passwordArray, newPassword]);

      await fetch("http://localhost:3000/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPassword)
      });

      setform({ site: "", username: "", password: "" });
      toast('Password saved!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });

    } else {
      toast('Error: Password not saved!');
    }
  };

  // Delete password
  const deletePassword = async (id) => {
    let c = confirm("Do you really want to delete this password?");
    if (c) {
      setPasswordArray(passwordArray.filter(item => item.id !== id));
      await fetch("http://localhost:3000/", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      toast('Password Deleted!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };

  // Edit password
  const editPassword = (id) => {
    setform({ ...passwordArray.find(i => i.id === id), id: id });
    setPasswordArray(passwordArray.filter(item => item.id !== id));
  };

  const handleChange = (e) => {
    setform({ ...form, [e.target.name]: e.target.value });
  };

  // Toggle password visibility
  const togglePassword = () => {
    passwordRef.current.type =
      passwordRef.current.type === "password" ? "text" : "password";
  };

  return (
    <>
      <ToastContainer />
      <div className="absolute inset-0 -z-10 h-full w-full bg-green-50 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-green-400 opacity-20 blur-[100px]"></div>
      </div>

      <div className="p-3 md:mycontainer min-h-[88.2vh]">
        <h1 className='text-4xl font-bold text-center'>
          <span className='text-green-500'> &lt;</span>
          <span>Pass</span>
          <span className='text-green-500'>OP/&gt;</span>
        </h1>
        <p className='text-green-900 text-lg text-center'>Your own Password Manager</p>

        <div className="flex flex-col p-4 text-black gap-8 items-center">
          <input
            value={form.site}
            onChange={handleChange}
            placeholder='Enter website URL'
            className='rounded-full border border-green-500 w-full p-4 py-1'
            type="text"
            name="site"
            id="site"
          />

          <div className="flex flex-col md:flex-row w-full justify-between gap-8">
            <input
              value={form.username}
              onChange={handleChange}
              placeholder='Enter Username'
              className='rounded-full border border-green-500 w-full p-4 py-1'
              type="text"
              name="username"
              id="username"
            />

            <div className="relative w-full">
              <input
                ref={passwordRef}
                value={form.password}
                onChange={handleChange}
                placeholder='Enter Password'
                className='rounded-full border border-green-500 w-full p-4 py-1'
                type="password"
                name="password"
                id="password"
              />

              {/* Text replaces eye icon */}
              <span
                className='absolute right-3 top-3 text-gray-700 font-medium cursor-pointer select-none'
                onClick={togglePassword}
              >
                Show Password
              </span>
            </div>
          </div>

          <button
            onClick={savePassword}
            className='flex justify-center items-center gap-2 bg-green-400 hover:bg-green-300 rounded-full px-8 py-2 w-fit border border-green-900'
          >
            Save
          </button>
        </div>

        {/* Display saved passwords */}
        <div className="passwords">
          <h2 className='font-bold text-2xl py-4'>Your Passwords</h2>

          {passwordArray.length === 0 && <div>No passwords to show</div>}

          {passwordArray.length !== 0 &&
            <table className="table-auto w-full rounded-md overflow-hidden mb-10">
              <thead className='bg-green-800 text-white'>
                <tr>
                  <th className='py-2'>Site</th>
                  <th className='py-2'>Username</th>
                  <th className='py-2'>Password</th>
                  <th className='py-2'>Actions</th>
                </tr>
              </thead>
              <tbody className='bg-green-100'>
                {passwordArray.map((item, index) => (
                  <tr key={index}>
                    <td className='py-2 border border-white text-center'>
                      <div className='flex items-center justify-center'>
                        <a href={item.site} target='_blank'>{item.site}</a>
                        <span 
                          className='ml-2 text-blue-600 cursor-pointer hover:underline'
                          onClick={() => copyText(item.site)}
                        >
                          Copy
                        </span>
                      </div>
                    </td>

                    <td className='py-2 border border-white text-center'>
                      <div className='flex items-center justify-center'>
                        <span>{item.username}</span>
                        <span 
                          className='ml-2 text-blue-600 cursor-pointer hover:underline'
                          onClick={() => copyText(item.username)}
                        >
                          Copy
                        </span>
                      </div>
                    </td>

                    <td className='py-2 border border-white text-center'>
                      <div className='flex items-center justify-center'>
                        <span>{"*".repeat(item.password.length)}</span>
                        <span 
                          className='ml-2 text-blue-600 cursor-pointer hover:underline'
                          onClick={() => copyText(item.password)}
                        >
                          Copy
                        </span>
                      </div>
                    </td>

                    <td className='justify-center py-2 border border-white text-center flex justify-center gap-2'>
                      <span 
                        className='cursor-pointer text-blue-600 hover:underline'
                        onClick={() => editPassword(item.id)}
                      >
                        Edit
                      </span>
                      <span 
                        className='cursor-pointer text-red-600 hover:underline'
                        onClick={() => deletePassword(item.id)}
                      >
                        Delete
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>}
        </div>
      </div>
    </>
  )
};

export default Manager;
