// Referencias a elementos del DOM
const form = document.getElementById('activityForm');
const fileInput = document.getElementById('attachments');
const fileInputArea = document.getElementById('fileInputArea');
const fileList = document.getElementById('fileList');
const resetBtn = document.getElementById('resetBtn');
const preview = document.getElementById('preview');
const previewContent = document.getElementById('previewContent');
const careerSelect = document.getElementById('career');
const careerOtherInput = document.getElementById('careerOther');

// Archivos seleccionados
let selectedFiles = [];

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    setMinDate();
});

// Configurar fecha mínima (hoy)
function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').setAttribute('min', today);
}

// Inicializar event listeners
function initializeEventListeners() {
    // Click en área de archivos
    fileInputArea.addEventListener('click', () => {
        fileInput.click();
    });

    // Cambio en input de archivos
    fileInput.addEventListener('change', handleFileSelect);

    // Cambio en carrera
    careerSelect.addEventListener('change', handleCareerChange);

    // Envío del formulario
    form.addEventListener('submit', handleFormSubmit);

    // Botón de reset
    resetBtn.addEventListener('input', handleFormChange);
    resetBtn.addEventListener('click', handleReset);

    // Validación en tiempo real
    form.addEventListener('input', handleFormChange);
}

// Manejar cambio en selección de carrera
function handleCareerChange() {
    if (careerSelect.value === 'otra') {
        careerOtherInput.classList.remove('hidden');
        careerOtherInput.setAttribute('required', 'required');
    } else {
        careerOtherInput.classList.add('hidden');
        careerOtherInput.removeAttribute('required');
        careerOtherInput.value = '';
    }
    updatePreview();
}

// Manejar selección de archivos
function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    
    // Validar tipos de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'video/mp4', 'video/avi', 'video/quicktime'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
        showError('attachmentsError', 'Algunos archivos no son válidos. Solo se permiten imágenes (JPG, PNG, GIF) y videos (MP4, AVI, MOV).');
        return;
    }

    // Validar tamaño (máximo 10MB por archivo)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
        showError('attachmentsError', 'Algunos archivos exceden el tamaño máximo de 10MB.');
        return;
    }

    selectedFiles = files;
    displayFileList();
    hideError('attachmentsError');
    updatePreview();
}

// Mostrar lista de archivos seleccionados
function displayFileList() {
    if (selectedFiles.length === 0) {
        fileList.classList.add('hidden');
        return;
    }

    fileList.classList.remove('hidden');
    fileList.innerHTML = '';

    selectedFiles.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'flex items-center justify-between bg-white p-3 rounded border border-gray-200';
        
        const fileInfo = document.createElement('div');
        fileInfo.className = 'flex items-center space-x-3 flex-1';
        
        const icon = document.createElement('i');
        icon.className = file.type.startsWith('image/') 
            ? 'fas fa-image text-blue-500' 
            : 'fas fa-video text-red-500';
        
        const fileDetails = document.createElement('div');
        fileDetails.className = 'flex-1 min-w-0';
        
        const fileName = document.createElement('p');
        fileName.className = 'text-sm font-medium text-gray-700 truncate';
        fileName.textContent = file.name;
        
        const fileSize = document.createElement('p');
        fileSize.className = 'text-xs text-gray-500';
        fileSize.textContent = formatFileSize(file.size);
        
        fileDetails.appendChild(fileName);
        fileDetails.appendChild(fileSize);
        fileInfo.appendChild(icon);
        fileInfo.appendChild(fileDetails);
        
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'text-red-500 hover:text-red-700 focus:outline-none';
        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
        removeBtn.addEventListener('click', () => removeFile(index));
        
        fileItem.appendChild(fileInfo);
        fileItem.appendChild(removeBtn);
        fileList.appendChild(fileItem);
    });
}

// Remover archivo de la lista
function removeFile(index) {
    selectedFiles.splice(index, 1);
    displayFileList();
    
    // Actualizar el input file
    const dataTransfer = new DataTransfer();
    selectedFiles.forEach(file => dataTransfer.items.add(file));
    fileInput.files = dataTransfer.files;
    
    updatePreview();
}

// Formatear tamaño de archivo
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Manejar cambio en el formulario (validación en tiempo real)
function handleFormChange() {
    validateForm();
    updatePreview();
}

// Validar formulario
function validateForm() {
    let isValid = true;

    // Validar título
    const title = document.getElementById('title').value.trim();
    if (title.length < 3) {
        showError('titleError', 'El título debe tener al menos 3 caracteres.');
        isValid = false;
    } else {
        hideError('titleError');
    }

    // Validar descripción
    const description = document.getElementById('description').value.trim();
    if (description.length < 10) {
        showError('descriptionError', 'La descripción debe tener al menos 10 caracteres.');
        isValid = false;
    } else {
        hideError('descriptionError');
    }

    // Validar carrera
    const career = document.getElementById('career').value;
    if (!career) {
        showError('careerError', 'Por favor seleccione una carrera.');
        isValid = false;
    } else if (career === 'otra') {
        const careerOther = document.getElementById('careerOther').value.trim();
        if (careerOther.length < 3) {
            showError('careerError', 'Por favor especifique la carrera.');
            isValid = false;
        } else {
            hideError('careerError');
        }
    } else {
        hideError('careerError');
    }

    // Validar fecha
    const date = document.getElementById('date').value;
    if (!date) {
        showError('dateError', 'Por favor seleccione una fecha.');
        isValid = false;
    } else {
        hideError('dateError');
    }

    // Validar lugar
    const location = document.getElementById('location').value.trim();
    if (location.length < 3) {
        showError('locationError', 'El lugar debe tener al menos 3 caracteres.');
        isValid = false;
    } else {
        hideError('locationError');
    }

    // Validar enlace (si está presente)
    const link = document.getElementById('additionalLink').value.trim();
    if (link && !isValidURL(link)) {
        showError('linkError', 'Por favor ingrese una URL válida.');
        isValid = false;
    } else {
        hideError('linkError');
    }

    return isValid;
}

// Validar URL
function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Mostrar error
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
}

// Ocultar error
function hideError(elementId) {
    const errorElement = document.getElementById(elementId);
    errorElement.classList.add('hidden');
}

// Actualizar vista previa
function updatePreview() {
    const formData = new FormData(form);
    const title = formData.get('title') || '';
    const description = formData.get('description') || '';
    const career = formData.get('career') || '';
    const careerOther = formData.get('careerOther') || '';
    const date = formData.get('date') || '';
    const location = formData.get('location') || '';
    const linkType = formData.get('linkType') || '';
    const link = formData.get('additionalLink') || '';

    if (!title && !description && !career && !date && !location) {
        preview.classList.add('hidden');
        return;
    }

    preview.classList.remove('hidden');
    
    const careerNames = {
        'ingenieria-sistemas': 'Ingeniería en Sistemas',
        'ingenieria-software': 'Ingeniería de Software',
        'ciencias-computacion': 'Ciencias de la Computación',
        'ingenieria-informatica': 'Ingeniería Informática',
        'otra': careerOther || 'Otra'
    };

    const linkTypeNames = {
        'inscripcion': 'Formulario de inscripción',
        'nota': 'Nota completa',
        'otro': 'Otro'
    };

    let html = '';
    
    if (title) {
        html += `<div><strong class="text-gray-700">Título:</strong> <span class="text-gray-600">${escapeHtml(title)}</span></div>`;
    }
    
    if (description) {
        html += `<div><strong class="text-gray-700">Descripción:</strong> <span class="text-gray-600">${escapeHtml(description)}</span></div>`;
    }
    
    if (career) {
        html += `<div><strong class="text-gray-700">Carrera:</strong> <span class="text-gray-600">${escapeHtml(careerNames[career] || career)}</span></div>`;
    }
    
    if (date) {
        const formattedDate = new Date(date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        html += `<div><strong class="text-gray-700">Fecha:</strong> <span class="text-gray-600">${formattedDate}</span></div>`;
    }
    
    if (location) {
        html += `<div><strong class="text-gray-700">Lugar:</strong> <span class="text-gray-600">${escapeHtml(location)}</span></div>`;
    }
    
    if (selectedFiles.length > 0) {
        html += `<div><strong class="text-gray-700">Archivos adjuntos:</strong> <span class="text-gray-600">${selectedFiles.length} archivo(s)</span></div>`;
    }
    
    if (link) {
        html += `<div><strong class="text-gray-700">${linkTypeNames[linkType] || 'Enlace'}:</strong> <a href="${escapeHtml(link)}" target="_blank" class="text-blue-600 hover:underline">${escapeHtml(link)}</a></div>`;
    }

    previewContent.innerHTML = html;
}

// Escapar HTML para prevenir XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// URL del webhook de n8n
const N8N_WEBHOOK_URL = 'https://unfraudulently-uninchoative-denna.ngrok-free.dev/webhook-test/formulario-1';

// Enviar datos al webhook de n8n
async function sendToN8NWebhook(activityData, files) {
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    
    try {
        // Mostrar estado de carga
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Enviando...';
        
        // Crear FormData para enviar datos y archivos
        const formDataToSend = new FormData();
        
        // Agregar datos del formulario
        formDataToSend.append('title', activityData.title);
        formDataToSend.append('description', activityData.description);
        formDataToSend.append('career', activityData.career);
        if (activityData.careerOther) {
            formDataToSend.append('careerOther', activityData.careerOther);
        }
        formDataToSend.append('date', activityData.date);
        formDataToSend.append('location', activityData.location);
        formDataToSend.append('linkType', activityData.linkType || '');
        if (activityData.additionalLink) {
            formDataToSend.append('additionalLink', activityData.additionalLink);
        }
        
        // Agregar información de archivos (metadatos)
        if (files.length > 0) {
            formDataToSend.append('filesCount', files.length.toString());
            files.forEach((file, index) => {
                formDataToSend.append(`file_${index}`, file);
                formDataToSend.append(`file_${index}_name`, file.name);
                formDataToSend.append(`file_${index}_type`, file.type);
                formDataToSend.append(`file_${index}_size`, file.size.toString());
            });
        }
        
        // Enviar al webhook de n8n
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            body: formDataToSend,
            headers: {
                // No establecer Content-Type, el navegador lo hará automáticamente con FormData
                // Esto es importante para que los archivos se envíen correctamente
            }
        });
        
        // Verificar respuesta
        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
        }
        
        // Intentar parsear la respuesta como JSON
        let responseData;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            responseData = await response.json();
        } else {
            responseData = await response.text();
        }
        
        console.log('Respuesta del webhook:', responseData);
        
        // Mostrar mensaje de éxito
        showSuccessMessage('¡Actividad enviada exitosamente a n8n!');
        
        // Opcional: resetear formulario después de enviar
        setTimeout(() => {
            if (confirm('¿Desea limpiar el formulario?')) {
                handleReset();
            }
        }, 2000);
        
    } catch (error) {
        console.error('Error al enviar al webhook:', error);
        showErrorMessage(`Error al enviar los datos: ${error.message}`);
    } finally {
        // Restaurar botón
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
    }
}

// Manejar envío del formulario
function handleFormSubmit(event) {
    event.preventDefault();

    if (!validateForm()) {
        alert('Por favor complete correctamente todos los campos requeridos.');
        return;
    }

    // Recopilar datos del formulario
    const formData = new FormData(form);
    const activityData = {
        title: formData.get('title'),
        description: formData.get('description'),
        career: formData.get('career'),
        careerOther: formData.get('careerOther'),
        date: formData.get('date'),
        location: formData.get('location'),
        linkType: formData.get('linkType'),
        additionalLink: formData.get('additionalLink'),
        files: selectedFiles.map(file => ({
            name: file.name,
            size: file.size,
            type: file.type
        }))
    };

    // Enviar datos al webhook de n8n
    sendToN8NWebhook(activityData, selectedFiles);
}

// Mostrar mensaje de éxito
function showSuccessMessage(message = '¡Actividad guardada exitosamente!') {
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center space-x-2 animate-fade-in';
    successDiv.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.style.opacity = '0';
        successDiv.style.transition = 'opacity 0.5s';
        setTimeout(() => {
            if (document.body.contains(successDiv)) {
                document.body.removeChild(successDiv);
            }
        }, 500);
    }, 3000);
}

// Mostrar mensaje de error
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center space-x-2 animate-fade-in';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.style.opacity = '0';
        errorDiv.style.transition = 'opacity 0.5s';
        setTimeout(() => {
            if (document.body.contains(errorDiv)) {
                document.body.removeChild(errorDiv);
            }
        }, 500);
    }, 5000);
}

// Manejar reset del formulario
function handleReset() {
    if (confirm('¿Está seguro de que desea limpiar el formulario? Todos los datos se perderán.')) {
        form.reset();
        selectedFiles = [];
        fileList.classList.add('hidden');
        careerOtherInput.classList.add('hidden');
        preview.classList.add('hidden');
        
        // Limpiar todos los errores
        const errorElements = document.querySelectorAll('[id$="Error"]');
        errorElements.forEach(el => {
            el.classList.add('hidden');
            el.textContent = '';
        });
        
        // Resetear input de archivos
        fileInput.value = '';
    }
}

