import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

function CompleteRegistration() {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [website, setWebsite] = useState("");
    const navigate = useNavigate();
    const { userId } = useParams();

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await fetch(`http://localhost:3001/users/${userId}`);
                if (response.ok) {
                    const userData = await response.json();
                    setName(userData.name || "");
                    setPhone(userData.phone || "");
                    setWebsite(userData.website || "");
                } else {
                    console.error("Failed to fetch user details");
                }
            } catch (error) {
                console.error("Error fetching user details:", error);
            }
        };

        if (userId) {
            fetchUserDetails();
        }
    }, [userId]);

    async function handleSave() {
        if (!name || !phone || !website) {
            alert("Please fill in all the fields.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/users/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name, phone: phone, website: website }),
            });

            if (response.ok) {
                const updatedUserData = await response.json();
                localStorage.setItem("currentUser", JSON.stringify(updatedUserData));
                alert("Profile updated successfully!");
                navigate(`/users/${userId}/home`);
            } else {
                const errorData = await response.json();
                alert(`Failed to update profile. Please try again. Error: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            alert(`Error updating profile: ${error.message}`);
        }
    }

    return (
        <div>
            <h2>Complete Your Profile</h2>
            <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <input
                type="text"
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
            />
            <input
                type="text"
                placeholder="Website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
            />
            <button onClick={handleSave}>Save</button>
        </div>
    );
}

export default CompleteRegistration;