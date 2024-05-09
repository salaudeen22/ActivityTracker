 async function SendData(userEmail,dataString) {
        try {
            const response = await fetch('http://localhost:4000/api/sendData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email:userEmail,
                    screen_data:[dataString]
                 
                })
            });
            
            if (response.ok) {
                const data = await response.json();
             
                return(data);
            } else {
              
                return(response.statusText);
            }
        } catch (error) {
           return(error);
        }
    };

