import React, { useState, useEffect } from 'react';

// Define your backend API base URL
// Make sure this matches where your Node.js API is running
const API_BASE_URL = 'http://localhost:5000';
// const API_BASE_URL = 'https://healthcare-referral-navigator.onrender.com'

// Facility hierarchy definition (kept in frontend for UI/logic presentation)
const facilityHierarchy = {
    'SUB_CEN': 'PHC',
    'PHC': 'CHC',
    'CHC': 'S_T_H',
    'S_T_H': 'District Hospital',
    'District Hospital': 'Medical College' // Assuming Medical College is the highest level
};

function ReferralPage() {
    // State for dropdown selections
    const [selectedState, setSelectedState] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedSubdistrict, setSelectedSubdistrict] = useState('');
    const [selectedFacilityName, setSelectedFacilityName] = useState('');

    // Options for dropdowns fetched from API
    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [subdistricts, setSubdistricts] = useState([]);
    const [facilityNames, setFacilityNames] = useState([]);

    // Search results and UI state
    const [searchResults, setSearchResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- Fetching Dropdown Options from Backend ---

    // Fetch states on initial load
    useEffect(() => {
        const fetchStates = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_BASE_URL}/api/states`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setStates(data);
            } catch (err) {
                console.error("Error fetching states:", err);
                setError('Failed to load states from API.');
            } finally {
                setLoading(false);
            }
        };
        fetchStates();
    }, []); // Empty dependency array means this runs once on component mount

    // Fetch districts when state changes
    useEffect(() => {
        const fetchDistricts = async () => {
            if (selectedState) {
                setLoading(true);
                setError(null);
                try {
                    const response = await fetch(`${API_BASE_URL}/api/districts/${encodeURIComponent(selectedState)}`);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    setDistricts(data);
                } catch (err) {
                    console.error("Error fetching districts:", err);
                    setError('Failed to load districts from API.');
                } finally {
                    setLoading(false);
                }
            } else {
                setDistricts([]); // Clear districts if no state selected
            }
            setSelectedDistrict(''); // Reset downstream selections when state changes
            setSelectedSubdistrict('');
            setSelectedFacilityName('');
            setSearchResults(null); // Clear search results
        };
        fetchDistricts();
    }, [selectedState]); // Re-run when selectedState changes

    // Fetch subdistricts when district changes
    useEffect(() => {
        const fetchSubdistricts = async () => {
            if (selectedState && selectedDistrict) {
                setLoading(true);
                setError(null);
                try {
                    const response = await fetch(`${API_BASE_URL}/api/subdistricts/${encodeURIComponent(selectedState)}/${encodeURIComponent(selectedDistrict)}`);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    setSubdistricts(data);
                } catch (err) {
                    console.error("Error fetching subdistricts:", err);
                    setError('Failed to load subdistricts from API.');
                } finally {
                    setLoading(false);
                }
            } else {
                setSubdistricts([]); // Clear subdistricts if no district selected
            }
            setSelectedSubdistrict(''); // Reset downstream selections
            setSelectedFacilityName('');
            setSearchResults(null); // Clear search results
        };
        fetchSubdistricts();
    }, [selectedState, selectedDistrict]); // Re-run when selectedState or selectedDistrict changes

    // Fetch facility names when subdistrict changes
    useEffect(() => {
        const fetchFacilityNames = async () => {
            if (selectedState && selectedDistrict && selectedSubdistrict) {
                setLoading(true);
                setError(null);
                try {
                    const response = await fetch(`${API_BASE_URL}/api/facilities/${encodeURIComponent(selectedState)}/${encodeURIComponent(selectedDistrict)}/${encodeURIComponent(selectedSubdistrict)}`);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    setFacilityNames(data);
                } catch (err) {
                    console.error("Error fetching facility names:", err);
                    setError('Failed to load facility names from API.');
                } finally {
                    setLoading(false);
                }
            } else {
                setFacilityNames([]); // Clear facility names if no subdistrict selected
            }
            setSelectedFacilityName(''); // Reset selection
            setSearchResults(null); // Clear search results
        };
        fetchFacilityNames();
    }, [selectedState, selectedDistrict, selectedSubdistrict]); // Re-run when selectedSubdistrict changes

    // Trigger referral search when a facility name is selected
    useEffect(() => {
        const performReferralSearch = async () => {
            if (selectedFacilityName && selectedState && selectedDistrict && selectedSubdistrict) {
                setLoading(true);
                setError(null);
                setSearchResults(null); // Clear previous results

                try {
                    const response = await fetch(`${API_BASE_URL}/api/referral`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            selectedState,
                            selectedDistrict,
                            selectedSubdistrict,
                            selectedFacilityName,
                        }),
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        // If response is not ok, the backend should send an error object
                        throw new Error(data.error || `HTTP error! status: ${response.status}`);
                    }
                    setSearchResults(data);
                } catch (err) {
                    console.error("Error performing referral search:", err);
                    setError(err.message || 'Failed to perform referral search.');
                } finally {
                    setLoading(false);
                }
            }
        };
        performReferralSearch();
    }, [selectedFacilityName, selectedState, selectedDistrict, selectedSubdistrict]); // Re-run when facility selected

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans antialiased">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-4xl space-y-8">
                <h1 className="text-4xl font-extrabold text-gray-800 text-center mb-6">
                    Healthcare Referral Navigator
                </h1>

                {/* Dropdown Selection Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {/* State Dropdown */}
                    <select
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        className="p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-lg"
                    >
                        <option value="">Select State</option>
                        {states.map(state => (
                            <option key={state} value={state}>{state}</option>
                        ))}
                    </select>

                    {/* District Dropdown */}
                    <select
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        className="p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-lg"
                        disabled={!selectedState || districts.length === 0}
                    >
                        <option value="">Select District</option>
                        {districts.map(district => (
                            <option key={district} value={district}>{district}</option>
                        ))}
                    </select>

                    {/* Subdistrict Dropdown */}
                    <select
                        value={selectedSubdistrict}
                        onChange={(e) => setSelectedSubdistrict(e.target.value)}
                        className="p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-lg"
                        disabled={!selectedDistrict || subdistricts.length === 0}
                    >
                        <option value="">Select Subdistrict</option>
                        {subdistricts.map(subdistrict => (
                            <option key={subdistrict} value={subdistrict}>{subdistrict}</option>
                        ))}
                    </select>

                    {/* Facility Name Dropdown */}
                    <select
                        value={selectedFacilityName}
                        onChange={(e) => setSelectedFacilityName(e.target.value)}
                        className="p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-lg"
                        disabled={!selectedSubdistrict || facilityNames.length === 0}
                    >
                        <option value="">Select Facility</option>
                        {facilityNames.map(name => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-sm" role="alert">
                        <p className="font-bold">Error:</p>
                        <p>{error}</p>
                    </div>
                )}

                {/* Loading Indicator */}
                {loading && (
                    <div className="text-center text-blue-600 font-semibold text-lg">
                        Loading...
                    </div>
                )}

                {/* Search Results Display */}
                {searchResults && (
                    <div className="space-y-6 mt-8">
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md shadow-sm">
                            <h2 className="text-2xl font-bold text-blue-800 mb-2">Starting Facility:</h2>
                            <p className="text-lg text-blue-700">
                                <span className="font-semibold">{searchResults.startFacility?.['Facility Name']}</span> (
                                {searchResults.startFacility?.['Facility Type']} - {searchResults.startFacility?.['District Name']})
                            </p>
                            {/* Added optional chaining and fallback for toFixed calls */}
                            <p className="text-blue-600 text-sm">
                                Lat: {searchResults.startFacility?.Latitude?.toFixed(5) || 'N/A'}, Lon: {searchResults.startFacility?.Longitude?.toFixed(5) || 'N/A'}
                            </p>
                        </div>

                        {searchResults.closestNextLevelFacility && (
                            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-md shadow-sm">
                                <h2 className="text-2xl font-bold text-green-800 mb-2">Closest Next-Level Facility in Same District:</h2>
                                <p className="text-xl text-green-700">
                                    <span className="font-semibold">{searchResults.closestNextLevelFacility['Facility Name']}</span>
                                    {' '} ({searchResults.closestNextLevelFacility['Facility Type']})
                                </p>
                                {/* Added optional chaining and fallback for toFixed calls */}
                                <p className="text-green-600 text-lg">
                                    Distance: {searchResults.closestNextLevelFacility?.['Distance (km)']?.toFixed(2) || 'N/A'} km
                                </p>
                                <p className="text-green-600 text-sm">
                                    Lat: {searchResults.closestNextLevelFacility?.Latitude?.toFixed(5) || 'N/A'}, Lon: {searchResults.closestNextLevelFacility?.Longitude?.toFixed(5) || 'N/A'}
                                </p>
                            </div>
                        )}

                        {searchResults.allNextLevelFacilities && searchResults.allNextLevelFacilities.length > 0 && (
                            <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-md shadow-sm">
                                <h2 className="text-2xl font-bold text-purple-800 mb-4">All Next-Level Facilities in Same District (by Distance):</h2>
                                <ul className="space-y-3">
                                    {searchResults.allNextLevelFacilities.map((f, index) => (
                                        <li key={index} className="flex justify-between items-center bg-purple-100 p-3 rounded-md shadow-sm">
                                            <span className="text-purple-700 text-lg">
                                                <span className="font-semibold">{f['Facility Name']}</span> ({f['Facility Type']})
                                            </span>
                                            {/* Added optional chaining and fallback for toFixed calls */}
                                            <span className="text-purple-600 text-md font-medium">
                                                {f?.['Distance (km)']?.toFixed(2) || 'N/A'} km
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>

    );
}

export default ReferralPage;


