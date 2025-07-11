"use client"

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { createClient } from "@/app/lib/supabase/client";
import toast from 'react-hot-toast';

const supabase = createClient();

const AddEmployeeModal = ({ isOpen, onClose, onEmployeeAdded }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 4;

    const [newEmployee, setNewEmployee] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        country: 'Nigeria',
        date_of_birth: '',
        hire_date: '',
        employment_status: 'Active',
        position_id: '',
        department_id: '',
        guarantor_name: '',
        guarantor_phone_number: '',
        salary: '',
        compensation: '',
        incentive: '',
    });

    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreviewUrl, setAvatarPreviewUrl] = useState(null);

    const [documentFiles, setDocumentFiles] = useState([]);

    const [loading, setLoading] = useState(false);

    const [positions, setPositions] = useState([]);
    const [departments, setDepartments] = useState([]);

    const avatarInputRef = useRef(null);
    const documentsInputRef = useRef(null);

    const modalContentRef = useRef(null);

    // Fetch positions and departments from Supabase
    useEffect(() => {
        if (isOpen) {
            const fetchLookupData = async () => {
                setLoading(true);
                try {
                    const { data: positionsData, error: positionsError } = await supabase
                        .from('positions')
                        .select('id, title');
                    if (positionsError) throw positionsError;
                    setPositions(positionsData);

                    const { data: departmentsData, error: departmentsError } = await supabase
                        .from('departments')
                        .select('id, name');
                    if (departmentsError) throw departmentsError;
                    setDepartments(departmentsData);
                } catch (error) {
                    console.error('Error fetching lookup data:', error.message);
                    toast.error('Failed to load positions or departments.');
                } finally {
                    setLoading(false);
                }
            };
            fetchLookupData();
        }
    }, [isOpen]);

    // Validates all required fields before submission
    const validateAllFields = useCallback(() => {
        const requiredFields = {
            1: ['first_name', 'last_name', 'email', 'date_of_birth'],
            2: ['phone_number', 'address', 'city', 'state', 'country'],
            3: ['hire_date', 'employment_status', 'position_id', 'department_id', 'guarantor_name', 'guarantor_phone_number'],
            4: ['salary', 'compensation', 'incentive'],
        };

        let isValid = true;
        let missingFields = [];

        for (const step in requiredFields) {
            requiredFields[step].forEach(field => {
                if (!newEmployee[field]) {
                    missingFields.push(field.replace(/_/g, ' '));
                    isValid = false;
                }
            });
        }

        if (!isValid) {
            toast.error(`Please fill all required fields: ${missingFields.join(', ')}`);
            return false;
        }

        if (!/\S+@\S+\.\S+/.test(newEmployee.email)) {
            toast.error('Please enter a valid email address.');
            return false;
        }

        if (isNaN(parseFloat(newEmployee.salary)) || parseFloat(newEmployee.salary) <= 0) {
            toast.error('Salary must be a positive number.');
            return false;
        }

        if (isNaN(parseFloat(newEmployee.compensation)) || parseFloat(newEmployee.compensation) < 0) {
            toast.error('Compensation must be a non-negative number.');
            return false;
        }

        if (isNaN(parseFloat(newEmployee.incentive)) || parseFloat(newEmployee.incentive) < 0) {
            toast.error('Incentive must be a non-negative number.');
            return false;
        }

        return true;
    }, [newEmployee]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewEmployee(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreviewUrl(URL.createObjectURL(file));
        } else {
            setAvatarFile(null);
            setAvatarPreviewUrl(null);
        }
    };

    const handleDocumentChange = (e) => {
        const files = Array.from(e.target.files);
        setDocumentFiles(prev => [...prev, ...files]);
    };

    const removeDocument = (indexToRemove) => {
        setDocumentFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const generateDefaultPassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
        let password = '';
        for (let i = 0; i < 12; i++) { // 12-character password
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    };

    const uploadFileToSupabase = async (file, bucketName, folderPath) => {
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = `${folderPath}/${fileName}`;
        const { error } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error(`Error uploading file to ${bucketName}:`, error);
            throw new Error(`Failed to upload ${file.name}: ${error.message}`);
        }

        const { data: publicUrlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);

        return publicUrlData.publicUrl;
    };

    const handleStepClick = (step) => {
        setCurrentStep(step);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!validateAllFields()) {
            setLoading(false);
            return;
        }

        const defaultPassword = generateDefaultPassword();
        const employeeEmail = newEmployee.email;
        const employeeFullName = `${newEmployee.first_name} ${newEmployee.last_name}`;

        let avatarUrl = null;
        let documentUrls = [];

        try {
            if (avatarFile) {
                avatarUrl = await uploadFileToSupabase(avatarFile, 'avatars', 'employee_avatars');
            }

            if (documentFiles.length > 0) {
                const uploadPromises = documentFiles.map(file =>
                    uploadFileToSupabase(file, 'documents', 'employee_documents')
                );
                documentUrls = await Promise.all(uploadPromises);
            }

            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: employeeEmail,
                password: defaultPassword,
                options: {
                    data: {
                        full_name: employeeFullName,
                        role: 'employee'
                    },
                    emailRedirectTo: `${window.location.origin}/dashboard`,
                },
            });

            if (authError) {
                if (authError.message.includes('already registered')) {
                    const { data: existingUser, error: existingUserError } = await supabase.auth.signInWithPassword({
                        email: employeeEmail,
                        password: defaultPassword,
                    });
                    if (existingUserError && existingUserError.message.includes('Invalid login credentials')) {
                        toast.error(`User with this email already exists but cannot be assigned with the default password. Please use a different email or reset the existing user's password manually in Supabase Auth.`);
                        setLoading(false);
                        return;
                    } else if (existingUserError) {
                        toast.error(`Error checking existing user: ${existingUserError.message}`);
                        setLoading(false);
                        return;
                    }
                    authData.user = existingUser.user;
                } else {
                    toast.error(`Failed to create user account: ${authError.message}`);
                    setLoading(false);
                    return;
                }
            }

            const userId = authData.user?.id;

            if (!userId) {
                toast.error("Failed to get user ID after authentication.");
                setLoading(false);
                return;
            }

            const employeeDataToInsert = {
                user_id: userId,
                first_name: newEmployee.first_name,
                last_name: newEmployee.last_name,
                email: newEmployee.email,
                phone_number: newEmployee.phone_number,
                address: newEmployee.address,
                city: newEmployee.city,
                state: newEmployee.state,
                zip_code: newEmployee.zip_code || null,
                country: newEmployee.country,
                date_of_birth: newEmployee.date_of_birth,
                hire_date: newEmployee.hire_date,
                employment_status: newEmployee.employment_status,
                position_id: newEmployee.position_id,
                department_id: newEmployee.department_id,
                guarantor_name: newEmployee.guarantor_name,
                guarantor_phone_number: newEmployee.guarantor_phone_number,
                salary: parseFloat(newEmployee.salary),
                compensation: parseFloat(newEmployee.compensation),
                incentive: parseFloat(newEmployee.incentive),
                avatar_url: avatarUrl,
                document_urls: documentUrls,
            };

            const { error: dbError } = await supabase
                .from('employees')
                .insert([employeeDataToInsert]);

            if (dbError) {
                console.error('Error adding employee to database:', dbError);
                toast.error(`Failed to add employee details: ${dbError.message}`);
            } else {
                toast.success('Employee registered and added successfully! Email with login details is being sent...');

                console.log(`--- SIMULATING EMAIL SEND ---`);
                console.log(`To: ${employeeEmail}`);
                console.log(`Subject: Welcome to Your Employee Dashboard!`);
                console.log(`Body:
                    Dear ${employeeFullName},

                    Welcome! Your employee dashboard is ready.
                    You can log in using the following credentials:

                    Username (Email): ${employeeEmail}
                    Default Password: ${defaultPassword}

                    Please log in and change your password immediately.

                    Dashboard Link: ${window.location.origin}/dashboard

                    Best regards,
                    Your HR Team
                `);
                console.log(`-----------------------------`);

                setTimeout(() => {
                    onEmployeeAdded();
                    onClose();
                    setNewEmployee({
                        first_name: '', last_name: '', email: '', phone_number: '', address: '', city: '', state: '', zip_code: '', country: 'Nigeria', date_of_birth: '', hire_date: '', employment_status: 'Active', position_id: '', department_id: '', guarantor_name: '', guarantor_phone_number: '', salary: '', compensation: '', incentive: '',
                    });
                    setAvatarFile(null);
                    setAvatarPreviewUrl(null);
                    setDocumentFiles([]);
                    setCurrentStep(1);
                    if (avatarInputRef.current) avatarInputRef.current.value = '';
                    if (documentsInputRef.current) documentsInputRef.current.value = '';
                }, 2500);
            }
        } catch (err) {
            console.error('Unexpected error during employee registration or file upload:', err);
            toast.error(`An unexpected error occurred: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <h3 className="md:col-span-2 text-lg font-semibold text-black mb-4">1. Personal Information</h3>
                        <div className="md:col-span-2 flex flex-col items-center mb-4">
                            <label htmlFor="avatar" className="block text-sm font-medium text-black mb-2">
                                Employee Photo
                            </label>
                            <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300 flex items-center justify-center mb-3">
                                {avatarPreviewUrl ? (
                                    <img src={avatarPreviewUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                                    </svg>
                                )}
                            </div>
                            <input
                                type="file"
                                id="avatar"
                                name="avatar"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                ref={avatarInputRef}
                                className="block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-md file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-[#b88b1b] file:text-white
                                    hover:file:bg-[#997417] cursor-pointer"
                            />
                        </div>

                        {/* First Name */}
                        <div>
                            <label htmlFor="first_name" className="block text-sm font-medium text-black mb-1">
                                First Name <span className="text-[#b88b1b]">*</span>
                            </label>
                            <input
                                type="text"
                                id="first_name"
                                name="first_name"
                                value={newEmployee.first_name}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-black rounded-md shadow-sm focus:outline-none focus:ring-[#b88b1b] focus:border-[#b88b1b] sm:text-sm text-black bg-white"
                            />
                        </div>
                        {/* Last Name */}
                        <div>
                            <label htmlFor="last_name" className="block text-sm font-medium text-black mb-1">
                                Last Name <span className="text-[#b88b1b]">*</span>
                            </label>
                            <input
                                type="text"
                                id="last_name"
                                name="last_name"
                                value={newEmployee.last_name}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-black rounded-md shadow-sm focus:outline-none focus:ring-[#b88b1b] focus:border-[#b88b1b] sm:text-sm text-black bg-white"
                            />
                        </div>
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-black mb-1">
                                Email <span className="text-[#b88b1b]">*</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={newEmployee.email}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-black rounded-md shadow-sm focus:outline-none focus:ring-[#b88b1b] focus:border-[#b88b1b] sm:text-sm text-black bg-white"
                            />
                        </div>
                        {/* Date of Birth */}
                        <div>
                            <label htmlFor="date_of_birth" className="block text-sm font-medium text-black mb-1">
                                Date of Birth <span className="text-[#b88b1b]">*</span>
                            </label>
                            <input
                                type="date"
                                id="date_of_birth"
                                name="date_of_birth"
                                value={newEmployee.date_of_birth}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-black rounded-md shadow-sm focus:outline-none focus:ring-[#b88b1b] focus:border-[#b88b1b] sm:text-sm text-black bg-white"
                            />
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <h3 className="md:col-span-2 text-lg font-semibold text-black mb-4">2. Address Information</h3>
                        {/* Phone Number */}
                        <div>
                            <label htmlFor="phone_number" className="block text-sm font-medium text-black mb-1">
                                Phone Number <span className="text-[#b88b1b]">*</span>
                            </label>
                            <input
                                type="tel"
                                id="phone_number"
                                name="phone_number"
                                value={newEmployee.phone_number}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-black rounded-md shadow-sm focus:outline-none focus:ring-[#b88b1b] focus:border-[#b88b1b] sm:text-sm text-black bg-white"
                            />
                        </div>
                        {/* Address */}
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-black mb-1">
                                Address <span className="text-[#b88b1b]">*</span>
                            </label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                value={newEmployee.address}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-black rounded-md shadow-sm focus:outline-none focus:ring-[#b88b1b] focus:border-[#b88b1b] sm:text-sm text-black bg-white"
                            />
                        </div>
                        {/* City */}
                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-black mb-1">
                                City <span className="text-[#b88b1b]">*</span>
                            </label>
                            <input
                                type="text"
                                id="city"
                                name="city"
                                value={newEmployee.city}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-black rounded-md shadow-sm focus:outline-none focus:ring-[#b88b1b] focus:border-[#b88b1b] sm:text-sm text-black bg-white"
                            />
                        </div>
                        {/* State */}
                        <div>
                            <label htmlFor="state" className="block text-sm font-medium text-black mb-1">
                                State <span className="text-[#b88b1b]">*</span>
                            </label>
                            <select
                                id="state"
                                name="state"
                                value={newEmployee.state}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-black rounded-md shadow-sm focus:outline-none focus:ring-[#b88b1b] focus:border-[#b88b1b] sm:text-sm text-black bg-white"
                            >
                                <option value="">Select a State</option> {/* Default empty option */}
                                <option value="Abia">Abia</option>
                                <option value="Adamawa">Adamawa</option>
                                <option value="Akwa Ibom">Akwa Ibom</option>
                                <option value="Anambra">Anambra</option>
                                <option value="Bauchi">Bauchi</option>
                                <option value="Bayelsa">Bayelsa</option>
                                <option value="Benue">Benue</option>
                                <option value="Borno">Borno</option>
                                <option value="Cross River">Cross River</option>
                                <option value="Delta">Delta</option>
                                <option value="Ebonyi">Ebonyi</option>
                                <option value="Edo">Edo</option>
                                <option value="Ekiti">Ekiti</option>
                                <option value="Enugu">Enugu</option>
                                <option value="Gombe">Gombe</option>
                                <option value="Imo">Imo</option>
                                <option value="Jigawa">Jigawa</option>
                                <option value="Kaduna">Kaduna</option>
                                <option value="Kano">Kano</option>
                                <option value="Katsina">Katsina</option>
                                <option value="Kebbi">Kebbi</option>
                                <option value="Kogi">Kogi</option>
                                <option value="Kwara">Kwara</option>
                                <option value="Lagos">Lagos</option>
                                <option value="Nasarawa">Nasarawa</option>
                                <option value="Niger">Niger</option>
                                <option value="Ogun">Ogun</option>
                                <option value="Ondo">Ondo</option>
                                <option value="Osun">Osun</option>
                                <option value="Oyo">Oyo</option>
                                <option value="Plateau">Plateau</option>
                                <option value="Rivers">Rivers</option>
                                <option value="Sokoto">Sokoto</option>
                                <option value="Taraba">Taraba</option>
                                <option value="Yobe">Yobe</option>
                                <option value="Zamfara">Zamfara</option>
                                <option value="FCT">FCT</option>
                            </select>
                        </div>
                        {/* Zip Code */}
                        <div>
                            <label htmlFor="zip_code" className="block text-sm font-medium text-black mb-1">
                                Zip Code
                            </label>
                            <input
                                type="text"
                                id="zip_code"
                                name="zip_code"
                                value={newEmployee.zip_code}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-black rounded-md shadow-sm focus:outline-none focus:ring-[#b88b1b] focus:border-[#b88b1b] sm:text-sm text-black bg-white"
                            />
                        </div>
                        {/* Country */}
                        <div>
                            <label htmlFor="country" className="block text-sm font-medium text-black mb-1">
                                Country <span className="text-[#b88b1b]">*</span>
                            </label>
                            <input
                                type="text"
                                id="country"
                                name="country"
                                value={newEmployee.country}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-black rounded-md shadow-sm focus:outline-none focus:ring-[#b88b1b] focus:border-[#b88b1b] sm:text-sm text-black bg-white"
                                disabled
                            />
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <h3 className="md:col-span-2 text-lg font-semibold text-black mb-4">3. Employment Details</h3>
                        {/* Hire Date */}
                        <div>
                            <label htmlFor="hire_date" className="block text-sm font-medium text-black mb-1">
                                Hire Date <span className="text-[#b88b1b]">*</span>
                            </label>
                            <input
                                type="date"
                                id="hire_date"
                                name="hire_date"
                                value={newEmployee.hire_date}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-black rounded-md shadow-sm focus:outline-none focus:ring-[#b88b1b] focus:border-[#b88b1b] sm:text-sm text-black bg-white"
                            />
                        </div>
                        {/* Employment Status */}
                        <div>
                            <label htmlFor="employment_status" className="block text-sm font-medium text-black mb-1">
                                Employment Status <span className="text-[#b88b1b]">*</span>
                            </label>
                            <select
                                id="employment_status"
                                name="employment_status"
                                value={newEmployee.employment_status}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-black rounded-md shadow-sm focus:outline-none focus:ring-[#b88b1b] focus:border-[#b88b1b] sm:text-sm text-black bg-white"
                            >
                                <option value="Active">Active</option>
                                <option value="On Leave">On Leave</option>
                                <option value="Terminated">Terminated</option>
                                <option value="Probation">Probation</option>
                                <option value="Transferred">Transferred</option>
                            </select>
                        </div>
                        {/* Position */}
                        <div>
                            <label htmlFor="position_id" className="block text-sm font-medium text-black mb-1">
                                Position <span className="text-[#b88b1b]">*</span>
                            </label>
                            <select
                                id="position_id"
                                name="position_id"
                                value={newEmployee.position_id}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-black rounded-md shadow-sm focus:outline-none focus:ring-[#b88b1b] focus:border-[#b88b1b] sm:text-sm text-black bg-white"
                            >
                                <option value="">Select Position</option>
                                {positions.map(position => (
                                    <option key={position.id} value={position.id}>{position.position_name}</option>
                                ))}
                            </select>
                        </div>
                        {/* Department */}
                        <div>
                            <label htmlFor="department_id" className="block text-sm font-medium text-black mb-1">
                                Department <span className="text-[#b88b1b]">*</span>
                            </label>
                            <select
                                id="department_id"
                                name="department_id"
                                value={newEmployee.department_id}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-black rounded-md shadow-sm focus:outline-none focus:ring-[#b88b1b] focus:border-[#b88b1b] sm:text-sm text-black bg-white"
                            >
                                <option value="">Select Department</option>
                                {departments.map(department => (
                                    <option key={department.id} value={department.id}>{department.department_name}</option>
                                ))}
                            </select>
                        </div>
                        {/* Guarantor Name */}
                        <div>
                            <label htmlFor="guarantor_name" className="block text-sm font-medium text-black mb-1">
                                Guarantor Name <span className="text-[#b88b1b]">*</span>
                            </label>
                            <input
                                type="text"
                                id="guarantor_name"
                                name="guarantor_name"
                                value={newEmployee.guarantor_name}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-black rounded-md shadow-sm focus:outline-none focus:ring-[#b88b1b] focus:border-[#b88b1b] sm:text-sm text-black bg-white"
                            />
                        </div>
                        {/* Guarantor Phone Number */}
                        <div>
                            <label htmlFor="guarantor_phone_number" className="block text-sm font-medium text-black mb-1">
                                Guarantor Phone Number <span className="text-[#b88b1b]">*</span>
                            </label>
                            <input
                                type="tel"
                                id="guarantor_phone_number"
                                name="guarantor_phone_number"
                                value={newEmployee.guarantor_phone_number}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-black rounded-md shadow-sm focus:outline-none focus:ring-[#b88b1b] focus:border-[#b88b1b] sm:text-sm text-black bg-white"
                            />
                        </div>
                        {/* Document Upload */}
                        <div className="md:col-span-2 mt-4">
                            <label htmlFor="documents" className="block text-sm font-medium text-black mb-1">
                                Documents (e.g., CV, Certificates)
                            </label>
                            <input
                                type="file"
                                id="documents"
                                name="documents"
                                multiple
                                onChange={handleDocumentChange}
                                ref={documentsInputRef}
                                className="block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-md file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-[#b88b1b] file:text-white
                                    hover:file:bg-[#997417] cursor-pointer"
                            />
                            <div className="mt-2 text-sm text-gray-600">
                                {documentFiles.length > 0 && (
                                    <p>Selected Files:</p>
                                )}
                                <ul className="list-disc list-inside">
                                    {documentFiles.map((file, index) => (
                                        <li key={index} className="flex justify-between items-center">
                                            <span>{file.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeDocument(index)}
                                                className="ml-2 text-red-600 hover:text-red-800"
                                            >
                                                &times;
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <h3 className="md:col-span-2 text-lg font-semibold text-black mb-4">4. Compensation Details</h3>
                        {/* Salary */}
                        <div>
                            <label htmlFor="salary" className="block text-sm font-medium text-black mb-1">
                                Salary <span className="text-[#b88b1b]">*</span>
                            </label>
                            <input
                                type="number"
                                id="salary"
                                name="salary"
                                value={newEmployee.salary}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-black rounded-md shadow-sm focus:outline-none focus:ring-[#b88b1b] focus:border-[#b88b1b] sm:text-sm text-black bg-white"
                            />
                        </div>
                        {/* Compensation */}
                        <div>
                            <label htmlFor="compensation" className="block text-sm font-medium text-black mb-1">
                                Compensation <span className="text-[#b88b1b]">*</span>
                            </label>
                            <input
                                type="number"
                                id="compensation"
                                name="compensation"
                                value={newEmployee.compensation}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-black rounded-md shadow-sm focus:outline-none focus:ring-[#b88b1b] focus:border-[#b88b1b] sm:text-sm text-black bg-white"
                            />
                        </div>
                        {/* Incentive */}
                        <div>
                            <label htmlFor="incentive" className="block text-sm font-medium text-black mb-1">
                                Incentive <span className="text-[#b88b1b]">*</span>
                            </label>
                            <input
                                type="number"
                                id="incentive"
                                name="incentive"
                                value={newEmployee.incentive}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-black rounded-md shadow-sm focus:outline-none focus:ring-[#b88b1b] focus:border-[#b88b1b] sm:text-sm text-black bg-white"
                            />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div
            className="fixed inset-0 bg-[#000000aa] bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
                onClick={(e) => e.stopPropagation()}
                ref={modalContentRef}
            >
                <div className="flex justify-between items-center mb-4 ">
                    <h2 className="text-xl font-bold text-black">Add New Employee</h2>
                    <button
                        onClick={onClose}
                        className="text-red-600 text-3xl hover:text-red-800"
                    >
                        &times;
                    </button>
                </div>
                <hr className="mb-4" />

                {/* Step Indicator */}
                <div className="flex justify-center items-center mb-6">
                    {Array.from({ length: totalSteps }, (_, i) => i + 1).map((stepNum) => (
                        <React.Fragment key={stepNum}>
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 cursor-pointer
                                    ${stepNum <= currentStep ? 'bg-[#b88b1b] border-[#b88b1b] text-white' : 'border-gray-300 text-gray-500'}`}
                                onClick={() => handleStepClick(stepNum)}
                            >
                                {stepNum}
                            </div>
                            {stepNum < totalSteps && (
                                <div className={`flex-1 h-1 ${stepNum < currentStep ? 'bg-[#b88b1b]' : 'bg-gray-300'}`}></div>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                <form onSubmit={handleSubmit}>
                    {renderStepContent()}

                    <div className="flex justify-between mt-6">
                        {currentStep > 1 && (
                            <button
                                type="button"
                                onClick={() => setCurrentStep(prev => prev - 1)}
                                className="px-4 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                                disabled={loading}
                            >
                                Back
                            </button>
                        )}

                        {currentStep < totalSteps ? (
                            <button
                                type="button"
                                onClick={() => setCurrentStep(prev => prev + 1)}
                                className="px-4 py-2 bg-[#b88b1b] text-white rounded-md hover:bg-[#997417] focus:outline-none focus:ring-2 focus:ring-[#b88b1b] focus:ring-opacity-50 ml-auto"
                                disabled={loading}
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                type="submit"
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 ml-auto"
                                disabled={loading}
                            >
                                {loading ? 'Submitting...' : 'Submit'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEmployeeModal;