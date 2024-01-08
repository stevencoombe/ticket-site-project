import React, { useState, useEffect } from 'react';

function VenueList() {
    const [venues, setVenues] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3000/venues')
            .then(response => response.json())
            .then(data => setVenues(data))
            .catch(error => console.error('Error fetching data: ', error));
    }, []);

    return (
        <div>
            <h1>Venues</h1>
            <ul>
                {venues.map(venue => (
                    <li key={venue.id}>
                        {venue.name} - {venue.address} - Max Capacity: {venue.maxCapacity}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default VenueList;
