// src/KpiDashboardPage.js
import React, { useState, useEffect } from 'react';

// IMPORTANT: Set this to the URL of your Node.js backend API
// It should now point to your merged backend's base URL
const API_BASE_URL = 'http://localhost:5000'; // Ensure this matches your Node.js server port

function KpiDashboardPage() { // Renamed from App to KpiDashboardPage
    // State for user selections
    const [states, setStates] = useState([]);
    const [selectedState, setSelectedState] = useState('');
    const [districts, setDistricts] = useState([]);
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [availableSources, setAvailableSources] = useState([]);
    const [selectedSource, setSelectedSource] = useState('');
    const [availableYears, setAvailableYears] = useState([]);
    const [selectedYear, setSelectedYear] = useState('');

    // State for data display
    const [kpiData, setKpiData] = useState([]);

    // State for loading and error handling
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(''); // For user-friendly messages

    // State to manage collapsed/expanded categories
    const [expandedCategories, setExpandedCategories] = useState(new Set());

    // Toggle function for category collapse/expand
    const toggleCategoryExpansion = (category) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(category)) {
                newSet.delete(category);
            } else {
                newSet.add(category);
            }
            return newSet;
        });
    };


    // --- Fetch States on Component Mount ---
    useEffect(() => {
        const fetchStates = async () => {
            setIsLoading(true);
            setError(null);
            setMessage('');
            try {
                // CORRECTED: Added /api/kpi prefix
                const response = await fetch(`${API_BASE_URL}/api/kpi/states`);
                if (!response.ok) {
                    const errorDetails = await response.text();
                    throw new Error(`HTTP error! status: ${response.status}. Details: ${errorDetails || response.statusText}`);
                }
                const data = await response.json();
                setStates(data);
                setMessage('Please select a State.');
            } catch (err) {
                setError(`Failed to load states. Please ensure your backend API is running and accessible at "${API_BASE_URL}". Error: ${err.message}.`);
                console.error("Error fetching states:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStates();
    }, []); // Empty dependency array means this runs once on mount

    // --- Fetch Districts when State changes ---
    useEffect(() => {
        // Immediately reset all subsequent filters and data when state changes
        setDistricts([]);
        setSelectedDistrict('');
        setAvailableSources([]);
        setSelectedSource('');
        setAvailableYears([]);
        setSelectedYear('');
        setKpiData([]); // Clear KPI data immediately when state changes
        setExpandedCategories(new Set()); // Collapse all categories on state change


        const fetchDistricts = async () => {
            if (!selectedState) {
                setMessage('Please select a State.'); // Reset message for initial state
                return;
            }
            setIsLoading(true);
            setError(null);
            setMessage(''); // Clear message during loading
            try {
                // CORRECTED: Added /api/kpi prefix
                const response = await fetch(`${API_BASE_URL}/api/kpi/districts?state=${encodeURIComponent(selectedState)}`);
                if (!response.ok) {
                    const errorDetails = await response.text();
                    throw new Error(`HTTP error! status: ${response.status}. Details: ${errorDetails || response.statusText}`);
                }
                const data = await response.json();
                setDistricts(data);
                setMessage(`Please select a District in ${selectedState}.`);
            } catch (err) {
                setError(`Failed to load districts for ${selectedState}. Error: ${err.message}.`);
                console.error("Error fetching districts:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDistricts();
    }, [selectedState]); // Re-run when selectedState changes

    // --- Fetch Available Sources when District changes ---
    useEffect(() => {
        // Immediately reset all subsequent filters and data when district changes
        setAvailableSources([]);
        setSelectedSource('');
        setAvailableYears([]);
        setSelectedYear('');
        setKpiData([]); // Clear KPI data immediately when district changes
        setExpandedCategories(new Set()); // Collapse all categories on district change

        const fetchAvailableSources = async () => {
            if (!selectedDistrict) {
                return;
            }
            setIsLoading(true);
            setError(null);
            setMessage('');
            try {
                // CORRECTED: Added /api/kpi prefix
                const response = await fetch(`${API_BASE_URL}/api/kpi/available-sources?districtId=${selectedDistrict}`);
                if (!response.ok) {
                    const errorDetails = await response.text();
                    throw new Error(`HTTP error! status: ${response.status}. Details: ${errorDetails || response.statusText}`);
                }
                const data = await response.json();
                setAvailableSources(data);
                if (data.length === 0) {
                    setMessage('No data sources available for this district.');
                } else {
                    setMessage('Please select a Data Source.');
                }
            } catch (err) {
                setError(`Failed to load available sources for selected district. Error: ${err.message}.`);
                console.error("Error fetching sources:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAvailableSources();
    }, [selectedDistrict]); // Re-run when selectedDistrict changes

    // --- Fetch Available Years when Source changes ---
    useEffect(() => {
        // Immediately reset all subsequent filters and data when source changes
        setAvailableYears([]);
        setSelectedYear('');
        setKpiData([]); // Clear KPI data immediately when source changes
        setExpandedCategories(new Set()); // Collapse all categories on source change

        const fetchAvailableYears = async () => {
            if (!selectedDistrict || !selectedSource) {
                return;
            }
            setIsLoading(true);
            setError(null);
            setMessage('');
            try {
                // CORRECTED: Added /api/kpi prefix
                const response = await fetch(`${API_BASE_URL}/api/kpi/available-years?districtId=${selectedDistrict}&source=${encodeURIComponent(selectedSource)}`);
                if (!response.ok) {
                    const errorDetails = await response.text();
                    throw new Error(`HTTP error! status: ${response.status}. Details: ${errorDetails || response.statusText}`);
                }
                const data = await response.json();
                setAvailableYears(data);
                if (data.length === 0) {
                    setMessage(`No years available for ${selectedSource} in this district.`);
                } else {
                    setMessage('Please select a Year.');
                }
            } catch (err) {
                setError(`Failed to load available years for ${selectedSource}. Error: ${err.message}.`);
                console.error("Error fetching years:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAvailableYears();
    }, [selectedDistrict, selectedSource]); // Re-run when selectedDistrict or selectedSource changes

    // --- Fetch KPI Data when all selections are made ---
    useEffect(() => {
        const fetchKpiData = async () => {
            if (!selectedDistrict || !selectedSource || !selectedYear) {
                setKpiData([]); // Ensure data is cleared if filters are incomplete
                setExpandedCategories(new Set()); // Collapse all categories
                return;
            }
            setIsLoading(true);
            setError(null);
            setMessage('');
            try {
                // CORRECTED: Added /api/kpi prefix
                const response = await fetch(`${API_BASE_URL}/api/kpi/kpi-data?districtId=${selectedDistrict}&source=${encodeURIComponent(selectedSource)}&year=${selectedYear}`);
                if (!response.ok) {
                    const errorDetails = await response.text();
                    throw new Error(`HTTP error! status: ${response.status}. Details: ${errorDetails || response.statusText}`);
                }
                const data = await response.json();
                setKpiData(data);
                if (data.length === 0) {
                    setMessage('No KPI data found for the selected criteria.');
                } else {
                    // Use the data returned from the API for the message, which includes state/district names
                    const firstKpi = data[0]; // Assuming first item has geo details
                    setMessage(`Displaying data for ${firstKpi.state_name} > ${firstKpi.district_name} > ${selectedSource} > ${selectedYear}`);
                }
            } catch (err) {
                setError('Failed to load KPI data.');
                console.error("Error fetching KPI data:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchKpiData();
    }, [selectedDistrict, selectedSource, selectedYear]);

    // Helper to get current district/state names for display
    const currentDistrict = districts.find(d => d.district_id === parseInt(selectedDistrict));

    // Group kpiData by category.
    const groupedKpiDataByCategory = kpiData.reduce((acc, item) => {
        const category = item.category || 'Uncategorized'; // Handle cases where category might be missing or null
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(item);
        return acc;
    }, {});

    // Sort categories alphabetically
    const sortedCategories = Object.keys(groupedKpiDataByCategory).sort();

    return (
        <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-8 rounded-lg p-3 bg-white shadow-md">Health KPI Dashboard</h1>

            <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-xl mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">Select Filters</h2>

                {isLoading && (
                    <div className="flex items-center justify-center p-4 text-blue-600">
                        <svg className="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading data...
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong className="font-bold">Error! </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {message && !error && !isLoading && (
                    <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <span className="block sm:inline">{message}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    {/* State Dropdown */}
                    <div>
                        <label htmlFor="state-select" className="block text-gray-700 text-sm font-bold mb-2">
                            Select State:
                        </label>
                        <select
                            id="state-select"
                            className="shadow border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-500"
                            value={selectedState}
                            onChange={(e) => setSelectedState(e.target.value)}
                            disabled={isLoading || states.length === 0}
                        >
                            <option value="">-- Choose State --</option>
                            {states.map((state, index) => (
                                <option key={index} value={state.state_name}>
                                    {state.state_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* District Dropdown */}
                    <div>
                        <label htmlFor="district-select" className="block text-gray-700 text-sm font-bold mb-2">
                            Select District:
                        </label>
                        <select
                            id="district-select"
                            className="shadow border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-500"
                            value={selectedDistrict}
                            onChange={(e) => setSelectedDistrict(e.target.value)}
                            disabled={isLoading || !selectedState || districts.length === 0}
                        >
                            <option value="">-- Choose District --</option>
                            {districts.map((district) => (
                                <option key={district.district_id} value={district.district_id}>
                                    {district.district_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Source Selection (Buttons or Dropdown) */}
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Select Source:
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {availableSources.length > 0 ? (
                                availableSources.map((source, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedSource(source)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500
                                            ${selectedSource === source ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-800 hover:bg-blue-200'}`
                                        }
                                        disabled={isLoading || !selectedDistrict}
                                    >
                                        {source}
                                    </button>
                                ))
                            ) : (
                                <span className="text-gray-500 text-sm">Select a district first.</span>
                            )}
                        </div>
                    </div>

                    {/* Year Dropdown */}
                    <div>
                        <label htmlFor="year-select" className="block text-gray-700 text-sm font-bold mb-2">
                            Select Year:
                        </label>
                        <select
                            id="year-select"
                            className="shadow border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-500"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            disabled={isLoading || !selectedSource || availableYears.length === 0}
                        >
                            <option value="">-- Choose Year --</option>
                            {availableYears.map((year, index) => (
                                <option key={index} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* KPI Data Display Grouped by Category */}
            <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-xl">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">KPI Data</h2>

                {isLoading && kpiData.length === 0 && !error ? (
                    <div className="text-center py-8 text-gray-600">Loading data...</div>
                ) : kpiData.length > 0 ? (
                    sortedCategories.map(category => (
                        <div key={category} className="mb-6 p-4 bg-purple-50 rounded-lg shadow-md">
                            <h3
                                className="text-xl font-bold text-purple-800 mb-3 pb-2 border-b border-purple-200 cursor-pointer flex justify-between items-center"
                                onClick={() => toggleCategoryExpansion(category)}
                            >
                                {/* Removed "Category: " prefix */}
                                {category}
                                <svg
                                    className={`w-6 h-6 transform transition-transform duration-300 ${expandedCategories.has(category) ? 'rotate-180' : 'rotate-0'}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </h3>
                            {expandedCategories.has(category) && (
                                <div className="mt-4">
                                    <div className="overflow-x-auto rounded-lg shadow-md">
                                        <table className="min-w-full divide-y divide-gray-200 table-auto">
                                            <thead className="bg-blue-100">
                                                <tr>
                                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-blue-700 uppercase tracking-wider w-1/2 md:w-1/3">
                                                        KPI Name
                                                    </th>
                                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-blue-700 uppercase tracking-wider w-1/4 md:w-1/6">
                                                        Value
                                                    </th>
                                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-blue-700 uppercase tracking-wider w-1/4 md:w-1/6">
                                                        Unit
                                                    </th>
                                                    {/* Removed Description Header */}
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {/* Sort KPIs alphabetically by name within each category */}
                                                {groupedKpiDataByCategory[category]
                                                    .sort((a,b) => a.kpi_name.localeCompare(b.kpi_name))
                                                    .map((kpi, index) => (
                                                    <tr key={`${category}-${kpi.kpi_id}-${index}`} className="hover:bg-gray-50">
                                                        <td className="px-4 py-2 whitespace-normal text-sm font-medium text-gray-900 w-1/2 md:w-1/3">
                                                            {kpi.kpi_name}
                                                        </td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 w-1/4 md:w-1/6">
                                                            {kpi.kpi_value !== null ? parseFloat(kpi.kpi_value).toLocaleString() : 'N/A'}
                                                        </td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 w-1/4 md:w-1/6">
                                                            {kpi.unit || 'N/A'}
                                                        </td>
                                                        {/* Removed Description Data Cell */}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-600">
                        {selectedYear ? "No data found for the selected filters." : "Select filters above to display KPI data."}
                    </div>
                )}
            </div>
        </div>
    );
}

export default KpiDashboardPage; // Renamed export