import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, MapPin, Building, Map, Plus, Edit2, Trash2, X, Search
} from 'lucide-react';
import { Button, Input, Modal } from '../components/ui';

// ⭐ CHANGED: keep country helpers, add generic helpers for states
import { 
  apiGet,
  apiPost,
  apiPut,
  apiDelete
} from '../api/api';

type MasterType = 'country' | 'state' | 'city' | 'locality';

interface Country {
  id: string | number;
  name: string;
  iso_code?: string | null;
  phone_code?: string | null;
  status: 'active' | 'inactive';
}

interface State {
  id: string | number;
  name: string;
  code: string;
  countryId: string | number;
  countryName: string;
  status: 'active' | 'inactive';
}

interface City {
  id: string;
  name: string;
  stateId: string;
  stateName: string;
  countryName: string;
  status: 'active' | 'inactive';
}

interface Locality {
  id: string;
  name: string;
  pincode: string;
  cityId: string;
  cityName: string;
  stateName: string;
  status: 'active' | 'inactive';
}

export default function MasterDataPage() {
  const [activeTab, setActiveTab] = useState<MasterType>('country');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination states
  const [countryPage, setCountryPage] = useState(1);
  const [statePage, setStatePage] = useState(1);
  const [cityPage, setCityPage] = useState(1);
  const [localityPage, setLocalityPage] = useState(1);
  const itemsPerPage = 5;

  // Countries (loaded from backend)
  const [countries, setCountries] = useState<Country[]>([]);

  // ⭐ CHANGED: states now come from backend, not hardcoded
  const [states, setStates] = useState<State[]>([]);

  const [cities, setCities] = useState<City[]>([
    { id: '1', name: 'Los Angeles', stateId: '1', stateName: 'California', countryName: 'United States', status: 'active' },
    { id: '2', name: 'San Francisco', stateId: '1', stateName: 'California', countryName: 'United States', status: 'active' },
    { id: '3', name: 'Houston', stateId: '2', stateName: 'Texas', countryName: 'United States', status: 'active' },
    { id: '4', name: 'Mumbai', stateId: '4', stateName: 'Maharashtra', countryName: 'India', status: 'active' },
  ]);

  const [localities, setLocalities] = useState<Locality[]>([
    { id: '1', name: 'Downtown LA', pincode: '90001', cityId: '1', cityName: 'Los Angeles', stateName: 'California', status: 'active' },
    { id: '2', name: 'Hollywood', pincode: '90028', cityId: '1', cityName: 'Los Angeles', stateName: 'California', status: 'active' },
    { id: '3', name: 'Financial District', pincode: '94111', cityId: '2', cityName: 'San Francisco', stateName: 'California', status: 'active' },
    { id: '4', name: 'Andheri', pincode: '400058', cityId: '4', cityName: 'Mumbai', stateName: 'Maharashtra', status: 'active' },
  ]);

  // Fetch countries from API (still using getCountries helper)
  // ⭐ CHANGED (COUNTRY API)
const fetchCountries = async () => {
  try {
    const res = await apiGet("/masterdata/country");
    const raw = res.data?.data || [];

    const mapped = raw.map((c: any) => ({
      id: c.id,
      name: c.name,
      iso_code: c.iso_code,
      phone_code: c.phone_code,
      status: c.status === 1 ? "active" : "inactive"
    }));

    setCountries(mapped);
  } catch (err) {
    console.error("Failed to fetch countries", err);
  }
};


  // ⭐ CHANGED: Fetch states from API
  const fetchStates = async () => {
    try {
      const res = await apiGet('/masterdata/state');
      const raw = (res.data as any)?.data || [];

      const mapped: State[] = raw.map((s: any) => ({
        id: s.id,
        name: s.name,
        code: s.state_code,
        countryId: s.country_id,
        countryName: countries.find(c => c.id == s.country_id)?.name || '',
        status: s.status === 1 ? 'active' : 'inactive',
      }));

      setStates(mapped);
    } catch (err) {
      console.error('Failed to fetch states', err);
    }
  };
  // ⭐ CHANGED (CITY API)
const fetchCities = async () => {
  try {
    const res = await apiGet("/masterdata/city");
    const raw = res.data?.data || [];

    const mapped = raw.map((c: any) => {
      const state = states.find(s => s.id == c.state_id);
      const country = countries.find(co => co.id == state?.countryId);

      return {
        id: c.id,
        name: c.name,
        stateId: String(c.state_id),
        stateName: state?.name || "",
        countryName: country?.name || "",
        status: c.status === 1 ? "active" : "inactive",
      };
    });

    setCities(mapped);
  } catch (err) {
    console.error("Failed to fetch cities", err);
  }
};
// ⭐ CHANGED (LOCALITY API)
const fetchLocalities = async () => {
  try {
    const res = await apiGet("/masterdata/locality");
    const raw = res.data?.data || [];

    const mapped = raw.map((l: any) => {
      const city = cities.find(c => c.id == l.city_id);
      const state = states.find(s => s.id == city?.stateId);

      return {
        id: l.id,
        name: l.name,
        pincode: l.pincode,
        cityId: String(l.city_id),
        cityName: city?.name || "",
        stateName: state?.name || "",
        status: l.status === 1 ? "active" : "inactive",
      };
    });

    setLocalities(mapped);
  } catch (err) {
    console.error("Failed to fetch localities", err);
  }
};



  useEffect(() => {
    // First, fetch countries
    fetchCountries();
  }, []);

  // Once countries are loaded, fetch states
  useEffect(() => {
    if (countries.length > 0) {
      fetchStates();
    }
  }, [countries]);

  // Once states are loaded, fetch cities
  useEffect(() => {
    if (states.length > 0) {
      fetchCities();
    }
  }, [states]);

  // Once cities are loaded, fetch localities
  useEffect(() => {
    if (cities.length > 0) {
      fetchLocalities();
    }
  }, [cities]);

  const tabs = [
    { id: 'country' as MasterType, label: 'Countries', icon: Globe, count: countries.length },
    { id: 'state' as MasterType, label: 'States', icon: Map, count: states.length },
    { id: 'city' as MasterType, label: 'Cities', icon: Building, count: cities.length },
    { id: 'locality' as MasterType, label: 'Localities', icon: MapPin, count: localities.length },
  ];

  const handleAdd = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      if (activeTab === 'country') {
        await apiDelete(`/masterdata/country/${id}`);
        await fetchCountries();
      } else if (activeTab === 'state') {
        // ⭐ CHANGED: delete state via backend API
        await apiDelete(`/masterdata/state/${id}`);
        await fetchStates();
      } else if (activeTab === 'city') {
        await apiDelete(`/masterdata/city/${id}`);
        await fetchCities();
      } else if (activeTab === 'locality') {
        await apiDelete(`/masterdata/locality/${id}`);
        await fetchLocalities();
      }
    } catch (err) {
      console.error('Failed to delete item', err);
      alert('Failed to delete item');
    }
  };

  const handleSave = async (data: any) => {
    try {
      if (editingItem) {
        // Update existing
        if (activeTab === 'country') {
          await apiPut(`/masterdata/country/${editingItem.id}`, {
            name: data.name,
            iso_code: data.iso_code,
            phone_code: data.phone_code,
            status: data.status === "active" ? 1 : 0,
           });
          await fetchCountries();
        } else if (activeTab === 'state') {
          // ⭐ CHANGED: update state via API
          await apiPut(`/masterdata/state/${editingItem.id}`, {
            country_id: Number(data.countryId),
            name: data.name,
            state_code: data.code.toUpperCase(),
            status: data.status === 'active' ? 1 : 0,
          });
          await fetchStates();
        } else if (activeTab === 'city') {
          // ⭐ CHANGED (CITY API) — UPDATE CITY
         await apiPut(`/masterdata/city/${editingItem.id}`, {
         state_id: Number(data.stateId),
         name: data.name,
         status: data.status === "active" ? 1 : 0,
        });

  await fetchCities();
        } else if (activeTab === 'locality') {
          // ⭐ CHANGED (LOCALITY API) — UPDATE LOCALITY
           await apiPut(`/masterdata/locality/${editingItem.id}`, {
           city_id: Number(data.cityId),
           name: data.name,
           pincode: data.pincode,
           status: data.status === "active" ? 1 : 0
           });

          await fetchLocalities();
        }
      } else {
        // Add new
        if (activeTab === 'country') {
          await apiPost("/masterdata/country", {
            name: data.name,
            iso_code: data.iso_code,
            phone_code: data.phone_code,
            status: data.status === "active" ? 1 : 0,
           });
          await fetchCountries();
        } else {
          const newItem = { ...data, id: Date.now().toString(), status: 'active' };

          switch (activeTab) {
            case 'state':
              // ⭐ CHANGED: create state via API
              await apiPost('/masterdata/state', {
                country_id: Number(data.countryId),
                name: data.name,
                state_code: data.code.toUpperCase(),
                status: data.status === 'active' ? 1 : 0,
              });
              await fetchStates();
              break;
            case 'city':
              // ⭐ CHANGED (CITY API) — CREATE CITY
              await apiPost("/masterdata/city", {
              state_id: Number(data.stateId),
              name: data.name,
              status: data.status === "active" ? 1 : 0,
              });

              await fetchCities();
              break;
            case 'locality':
              // ⭐ CHANGED (LOCALITY API) — CREATE LOCALITY
             await apiPost("/masterdata/locality", {
             city_id: Number(data.cityId),
             name: data.name,
             pincode: data.pincode,
             status: data.status === "active" ? 1 : 0
            });

            await fetchLocalities();
              break;
          }
        }
      }
      setShowModal(false);
    } catch (err) {
      console.error('Failed to save item', err);
      alert('Failed to save item');
    }
  };

  const filterData = (data: any[]) => {
    if (!searchQuery) return data;
    return data.filter(item => 
      JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getPaginatedData = (data: any[], page: number, pageSize: number) => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-cyan-500 text-cyan-600 font-semibold'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{tab.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    activeTab === tab.id
                      ? 'bg-cyan-100 text-cyan-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-cyan-500 text-sm"
            />
          </div>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all cursor-pointer flex items-center gap-2 font-semibold text-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Add {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </button>
        </div>

        {/* Tables */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'country' && (() => {
              const filteredData = filterData(countries);
              const totalPages = Math.ceil(filteredData.length / itemsPerPage);
              return (
                <>
                  <CountryTable 
                    data={getPaginatedData(filteredData, countryPage, itemsPerPage)} 
                    onEdit={handleEdit} 
                    onDelete={handleDelete} 
                  />
                  {totalPages > 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-b-2xl shadow-lg p-6 border-t border-gray-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          Showing {Math.min((countryPage - 1) * itemsPerPage + 1, filteredData.length)} to {Math.min(countryPage * itemsPerPage, filteredData.length)} of {filteredData.length}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setCountryPage(prev => Math.max(prev - 1, 1))}
                            disabled={countryPage === 1}
                            className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                              countryPage === 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200'
                            }`}
                          >
                            ← Prev
                          </button>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => setCountryPage(page)}
                              className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                                countryPage === page
                                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                          <button
                            onClick={() => setCountryPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={countryPage === totalPages}
                            className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                              countryPage === totalPages
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200'
                            }`}
                          >
                            Next →
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </>
              );
            })()}
            
            {activeTab === 'state' && (() => {
              const filteredData = filterData(states);
              const totalPages = Math.ceil(filteredData.length / itemsPerPage);
              return (
                <>
                  <StateTable 
                    data={getPaginatedData(filteredData, statePage, itemsPerPage)} 
                    onEdit={handleEdit} 
                    onDelete={handleDelete} 
                  />
                  {totalPages > 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-b-2xl shadow-lg p-6 border-t border-gray-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          Showing {Math.min((statePage - 1) * itemsPerPage + 1, filteredData.length)} to {Math.min(statePage * itemsPerPage, filteredData.length)} of {filteredData.length}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setStatePage(prev => Math.max(prev - 1, 1))}
                            disabled={statePage === 1}
                            className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                              statePage === 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200'
                            }`}
                          >
                            ← Prev
                          </button>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => setStatePage(page)}
                              className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                                statePage === page
                                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                          <button
                            onClick={() => setStatePage(prev => Math.min(prev + 1, totalPages))}
                            disabled={statePage === totalPages}
                            className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                              statePage === totalPages
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200'
                            }`}
                          >
                            Next →
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </>
              );
            })()}
            
            {activeTab === 'city' && (() => {
              const filteredData = filterData(cities);
              const totalPages = Math.ceil(filteredData.length / itemsPerPage);
              return (
                <>
                  <CityTable 
                    data={getPaginatedData(filteredData, cityPage, itemsPerPage)} 
                    onEdit={handleEdit} 
                    onDelete={handleDelete} 
                  />
                  {totalPages > 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-b-2xl shadow-lg p-6 border-t border-gray-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          Showing {Math.min((cityPage - 1) * itemsPerPage + 1, filteredData.length)} to {Math.min(cityPage * itemsPerPage, filteredData.length)} of {filteredData.length}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setCityPage(prev => Math.max(prev - 1, 1))}
                            disabled={cityPage === 1}
                            className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                              cityPage === 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200'
                            }`}
                          >
                            ← Prev
                          </button>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => setCityPage(page)}
                              className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                                cityPage === page
                                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                          <button
                            onClick={() => setCityPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={cityPage === totalPages}
                            className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                              cityPage === totalPages
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200'
                            }`}
                          >
                            Next →
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </>
              );
            })()}
            
            {activeTab === 'locality' && (() => {
              const filteredData = filterData(localities);
              const totalPages = Math.ceil(filteredData.length / itemsPerPage);
              return (
                <>
                  <LocalityTable 
                    data={getPaginatedData(filteredData, localityPage, itemsPerPage)} 
                    onEdit={handleEdit} 
                    onDelete={handleDelete} 
                  />
                  {totalPages > 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-b-2xl shadow-lg p-6 border-t border-gray-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          Showing {Math.min((localityPage - 1) * itemsPerPage + 1, filteredData.length)} to {Math.min(localityPage * itemsPerPage, filteredData.length)} of {filteredData.length}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setLocalityPage(prev => Math.max(prev - 1, 1))}
                            disabled={localityPage === 1}
                            className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                              localityPage === 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200'
                            }`}
                          >
                            ← Prev
                          </button>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => setLocalityPage(page)}
                              className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                                localityPage === page
                                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                          <button
                            onClick={() => setLocalityPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={localityPage === totalPages}
                            className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                              localityPage === totalPages
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200'
                            }`}
                          >
                            Next →
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </>
              );
            })()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modal */}
      {showModal && (
        <MasterModal
          type={activeTab}
          item={editingItem}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          countries={countries}
          states={states}
          cities={cities}
        />
      )}
    </div>
  );
}

// Country Table
function CountryTable({ data, onEdit, onDelete }: { data: Country[], onEdit: (item: any) => void, onDelete: (id: string | number) => void }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Country Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">ISO Code</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Phone Code</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((country) => (
              <tr key={country.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{country.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{country.iso_code ?? '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{country.phone_code ?? '-'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    country.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {country.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(country)}
                      className="p-1.5 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(country.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length === 0 && (
        <div className="text-center py-12">
          <Globe className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No countries found</p>
        </div>
      )}
    </div>
  );
}

// State Table
function StateTable({ data, onEdit, onDelete }: { data: State[], onEdit: (item: any) => void, onDelete: (id: string | number) => void }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">State Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Code</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Country</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((state) => (
              <tr key={state.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{state.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{state.code}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{state.countryName}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    state.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {state.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(state)}
                      className="p-1.5 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(state.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length === 0 && (
        <div className="text-center py-12">
          <Map className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No states found</p>
        </div>
      )}
    </div>
  );
}

// City Table
function CityTable({ data, onEdit, onDelete }: { data: City[], onEdit: (item: any) => void, onDelete: (id: string) => void }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">City Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">State</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Country</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((city) => (
              <tr key={city.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{city.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{city.stateName}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{city.countryName}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    city.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {city.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(city)}
                      className="p-1.5 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(city.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length === 0 && (
        <div className="text-center py-12">
          <Building className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No cities found</p>
        </div>
      )}
    </div>
  );
}

// Locality Table
function LocalityTable({ data, onEdit, onDelete }: { data: Locality[], onEdit: (item: any) => void, onDelete: (id: string) => void }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Locality Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Zipcode</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">City</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">State</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((locality) => (
              <tr key={locality.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{locality.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{locality.pincode}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{locality.cityName}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{locality.stateName}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    locality.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {locality.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(locality)}
                      className="p-1.5 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(locality.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No localities found</p>
        </div>
      )}
    </div>
  );
}

// Modal Component
function MasterModal({ 
  type, 
  item, 
  onClose, 
  onSave, 
  countries, 
  states, 
  cities 
}: { 
  type: MasterType, 
  item: any, 
  onClose: () => void, 
  onSave: (data: any) => void,
  countries: Country[],
  states: State[],
  cities: City[]
}) {
  const [formData, setFormData] = useState(item || {});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Add relationships based on type
    if (type === 'state' && formData.countryId) {
      const country = countries.find(c => c.id == formData.countryId);
      formData.countryName = country?.name;
    } else if (type === 'city' && formData.stateId) {
      const state = states.find(s => s.id == formData.stateId);
      const country = countries.find(c => c.id == state?.countryId);
      formData.stateName = state?.name;
      formData.countryName = country?.name;
    } else if (type === 'locality' && formData.cityId) {
      const city = cities.find(c => c.id == formData.cityId);
      const state = states.find(s => s.id == city?.stateId);
      formData.cityName = city?.name;
      formData.stateName = state?.name;
    }
    
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-white rounded-xl max-w-md w-full p-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black">
            {item ? 'Edit' : 'Add'} {type.charAt(0).toUpperCase() + type.slice(1)}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {type === 'country' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Country Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value.replace(/[^a-zA-Z\s]/g, '') })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-cyan-500 text-sm"
                  placeholder="Enter country name"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">ISO Code <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.iso_code || ''}
                  onChange={(e) => setFormData({ ...formData, iso_code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-cyan-500 text-sm"
                  placeholder="e.g., US"
                  maxLength={3}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Code</label>
                <input
                  type="text"
                  value={formData.phone_code || ''}
                  onChange={(e) => setFormData({ ...formData, phone_code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-cyan-500 text-sm"
                  placeholder="e.g., +1"
                  maxLength={6}
                />
              </div>
            </>
          )}

          {type === 'state' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Country <span className="text-red-500">*</span></label>
                <select
                  required
                  value={formData.countryId || ''}
                  onChange={(e) => setFormData({ ...formData, countryId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-cyan-500 text-sm"
                >
                  <option value="">Select Country</option>
                  {countries.map(country => (
                    <option key={country.id} value={country.id}>{country.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">State Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value.replace(/[^a-zA-Z\s]/g, '') })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-cyan-500 text-sm"
                  placeholder="Enter state name"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">State Code <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.code || ''}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-cyan-500 text-sm"
                  placeholder="e.g., CA"
                  maxLength={3}
                />
              </div>
            </>
          )}

          {type === 'city' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">State <span className="text-red-500">*</span></label>
                <select
                  required
                  value={formData.stateId || ''}
                  onChange={(e) => setFormData({ ...formData, stateId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-cyan-500 text-sm"
                >
                  <option value="">Select State</option>
                  {states.map(state => (
                    <option key={state.id} value={state.id}>{state.name} ({state.countryName})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">City Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value.replace(/[^a-zA-Z\s]/g, '') })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-cyan-500 text-sm"
                  placeholder="Enter city name"
                />
              </div>
            </>
          )}

          {type === 'locality' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">City <span className="text-red-500">*</span></label>
                <select
                  required
                  value={formData.cityId || ''}
                  onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-cyan-500 text-sm"
                >
                  <option value="">Select City</option>
                  {cities.map(city => (
                    <option key={city.id} value={city.id}>{city.name}, {city.stateName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Locality Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value.replace(/[^a-zA-Z\s]/g, '') })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-cyan-500 text-sm"
                  placeholder="Enter locality name"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Zipcode <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.pincode || ''}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-cyan-500 text-sm"
                  placeholder="Enter zipcode"
                  maxLength={10}
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Status <span className="text-red-500">*</span></label>
            <select
              value={formData.status || 'active'}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-cyan-500 text-sm"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all cursor-pointer text-sm font-semibold"
            >
              {item ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
