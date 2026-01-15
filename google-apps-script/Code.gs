/**
 * ẨM THỰC GIÁO TUYẾT - Google Apps Script API
 * 
 * Hướng dẫn sử dụng:
 * 1. Tạo Google Sheet mới
 * 2. Extensions > Apps Script
 * 3. Copy toàn bộ code này vào Code.gs
 * 4. Chạy function setupSheets() để tạo các sheet
 * 5. Deploy > New deployment > Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Copy Web App URL vào file .env.local
 */

// ==================== SHEET NAMES ====================
const SHEET_NAMES = {
  MENUS: 'Menus',
  QUOTES: 'Quotes', 
  ORDERS: 'Orders',
  CALENDAR: 'Calendar',
  VENDORS: 'Vendors',
  FINANCE: 'Finance',
  SETTINGS: 'Settings'
};

// ==================== SETUP ====================

/**
 * Chạy function này một lần để tạo các sheet với headers
 */
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Menus Sheet
  createSheetWithHeaders(ss, SHEET_NAMES.MENUS, [
    'menu_id', 'name', 'category', 'selling_price', 'cost_price', 'unit', 'description', 'active', 'created_at'
  ]);
  
  // Quotes Sheet  
  createSheetWithHeaders(ss, SHEET_NAMES.QUOTES, [
    'quote_id', 'customer_name', 'phone', 'event_type', 'event_date', 'location', 
    'num_tables', 'dishes_input', 'staff_count', 'table_type', 'subtotal', 'total', 'status', 'created_at'
  ]);
  
  // Orders Sheet
  createSheetWithHeaders(ss, SHEET_NAMES.ORDERS, [
    'order_id', 'quote_id', 'customer_name', 'phone', 'event_type', 'event_date', 'event_time',
    'location', 'guest_count', 'menu_items', 'total_amount', 'deposit', 'remaining', 
    'status', 'assigned_vendors', 'created_at', 'notes'
  ]);
  
  // Calendar Sheet
  createSheetWithHeaders(ss, SHEET_NAMES.CALENDAR, [
    'event_id', 'order_id', 'title', 'event_date', 'start_time', 'end_time', 
    'event_type', 'location', 'status', 'color'
  ]);
  
  // Vendors Sheet
  createSheetWithHeaders(ss, SHEET_NAMES.VENDORS, [
    'vendor_id', 'name', 'category', 'phone', 'address', 'specialties', 
    'rating', 'price_range', 'active', 'notes'
  ]);
  
  // Finance Sheet (Sổ cái thu chi)
  createSheetWithHeaders(ss, SHEET_NAMES.FINANCE, [
    'transaction_id', 'order_id', 'date', 'type', 'category', 'amount', 
    'payment_method', 'vendor_id', 'description', 'receipt_url', 'created_by', 'created_at', 'updated_at'
  ]);
  
  // Settings Sheet
  createSheetWithHeaders(ss, SHEET_NAMES.SETTINGS, [
    'key', 'value', 'description', 'updated_at'
  ]);
  
  Logger.log('All sheets created successfully!');
}

function createSheetWithHeaders(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  
  // Set headers
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#f3f4f6');
  
  return sheet;
}

// ==================== WEB APP HANDLERS ====================

function doGet(e) {
  try {
    const action = e.parameter.action;
    let result;
    
    switch(action) {
      case 'getMenus':
        result = getMenus(e.parameter.category, e.parameter.eventType);
        break;
      case 'getQuotes':
        result = getQuotes();
        break;
      case 'getQuote':
        result = getQuoteById(e.parameter.quoteId);
        break;
      case 'getOrders':
        result = getOrders(e.parameter.status);
        break;
      case 'getOrder':
        result = getOrderById(e.parameter.orderId);
        break;
      case 'getCalendarEvents':
        result = getCalendarEvents(e.parameter.year, e.parameter.month, e.parameter.date);
        break;
      case 'getVendors':
        result = getVendors(e.parameter.category);
        break;
      case 'getVendor':
        result = getVendorById(e.parameter.vendorId);
        break;
      case 'getTransactions':
        result = getTransactions(e.parameter.type, e.parameter.orderId, e.parameter.startDate, e.parameter.endDate);
        break;
      case 'getFinanceSummary':
        result = getFinanceSummary(e.parameter.startDate, e.parameter.endDate);
        break;
      case 'getSetting':
        result = getSetting(e.parameter.key);
        break;
      case 'getAllSettings':
        result = getAllSettings();
        break;
      default:
        result = { error: 'Unknown action' };
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    let result;
    
    switch(action) {
      case 'createMenu':
        result = createMenu(data.menu);
        break;
      case 'updateMenu':
        result = updateMenu(data.menu);
        break;
      case 'deleteMenu':
        result = deleteRow(SHEET_NAMES.MENUS, 'menu_id', data.menuId);
        break;
      case 'createQuote':
        result = createQuote(data.quote);
        break;
      case 'updateQuote':
        result = updateQuote(data.quote);
        break;
      case 'deleteQuote':
        result = deleteRow(SHEET_NAMES.QUOTES, 'quote_id', data.quoteId);
        break;
      case 'convertQuoteToOrder':
        result = convertQuoteToOrder(data.quoteId);
        break;
      case 'createOrder':
        result = createOrder(data.order);
        break;
      case 'updateOrder':
        result = updateOrder(data.order);
        break;
      case 'updateOrderStatus':
        result = updateOrderStatus(data.orderId, data.status);
        break;
      case 'deleteOrder':
        result = deleteRow(SHEET_NAMES.ORDERS, 'order_id', data.orderId);
        break;
      case 'createCalendarEvent':
        result = createCalendarEvent(data.event);
        break;
      case 'updateCalendarEvent':
        result = updateCalendarEvent(data.event);
        break;
      case 'deleteCalendarEvent':
        result = deleteRow(SHEET_NAMES.CALENDAR, 'event_id', data.eventId);
        break;
      case 'createVendor':
        result = createVendor(data.vendor);
        break;
      case 'updateVendor':
        result = updateVendor(data.vendor);
        break;
      case 'deleteVendor':
        result = deleteRow(SHEET_NAMES.VENDORS, 'vendor_id', data.vendorId);
        break;
      case 'createTransaction':
        result = createTransaction(data.transaction);
        break;
      case 'updateTransaction':
        result = updateTransaction(data.transaction);
        break;
      case 'deleteTransaction':
        result = deleteRow(SHEET_NAMES.FINANCE, 'transaction_id', data.transactionId);
        break;
      case 'setSetting':
        result = setSetting(data.key, data.value);
        break;
      default:
        result = { error: 'Unknown action' };
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ==================== HELPER FUNCTIONS ====================

function getSheet(sheetName) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
}

function getAllData(sheetName) {
  const sheet = getSheet(sheetName);
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      let value = row[index];
      // Parse JSON fields
      if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
        try { value = JSON.parse(value); } catch(e) {}
      }
      obj[header] = value;
    });
    return obj;
  });
}

function findRowIndex(sheetName, columnName, value) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const colIndex = headers.indexOf(columnName);
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][colIndex] === value) {
      return i + 1; // 1-indexed
    }
  }
  return -1;
}

function appendRow(sheetName, rowData) {
  const sheet = getSheet(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  const row = headers.map(header => {
    let value = rowData[header];
    // Stringify arrays/objects
    if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
      value = JSON.stringify(value);
    }
    return value || '';
  });
  
  sheet.appendRow(row);
  return rowData;
}

function updateRow(sheetName, idColumn, idValue, newData) {
  const sheet = getSheet(sheetName);
  const rowIndex = findRowIndex(sheetName, idColumn, idValue);
  
  if (rowIndex === -1) {
    return { error: 'Row not found' };
  }
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row = headers.map(header => {
    let value = newData[header];
    if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
      value = JSON.stringify(value);
    }
    return value !== undefined ? value : '';
  });
  
  sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
  return newData;
}

function deleteRow(sheetName, idColumn, idValue) {
  const sheet = getSheet(sheetName);
  const rowIndex = findRowIndex(sheetName, idColumn, idValue);
  
  if (rowIndex === -1) {
    return { error: 'Row not found' };
  }
  
  sheet.deleteRow(rowIndex);
  return { success: true };
}

function generateId(prefix) {
  const timestamp = new Date().getTime().toString(36);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// ==================== MENU FUNCTIONS ====================

function getMenus(category, eventType) {
  let menus = getAllData(SHEET_NAMES.MENUS);
  
  if (category) {
    menus = menus.filter(m => m.category === category);
  }
  if (eventType) {
    menus = menus.filter(m => m.event_types && m.event_types.includes(eventType));
  }
  
  return menus.filter(m => m.active !== false);
}

function createMenu(menu) {
  menu.menu_id = generateId('MNU');
  menu.created_at = new Date().toISOString();
  menu.active = true;
  return appendRow(SHEET_NAMES.MENUS, menu);
}

function updateMenu(menu) {
  return updateRow(SHEET_NAMES.MENUS, 'menu_id', menu.menu_id, menu);
}

// ==================== QUOTE FUNCTIONS ====================

function getQuotes() {
  return getAllData(SHEET_NAMES.QUOTES);
}

function getQuoteById(quoteId) {
  const quotes = getAllData(SHEET_NAMES.QUOTES);
  return quotes.find(q => q.quote_id === quoteId) || null;
}

function createQuote(quote) {
  const now = new Date();
  const dateStr = Utilities.formatDate(now, 'GMT+7', 'yyyyMMdd');
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  
  quote.quote_id = `QT-${dateStr}-${random}`;
  quote.created_at = now.toISOString();
  quote.status = quote.status || 'draft';
  
  return appendRow(SHEET_NAMES.QUOTES, quote);
}

function updateQuote(quote) {
  return updateRow(SHEET_NAMES.QUOTES, 'quote_id', quote.quote_id, quote);
}

function convertQuoteToOrder(quoteId) {
  const quote = getQuoteById(quoteId);
  if (!quote) {
    return { error: 'Quote not found' };
  }
  
  const now = new Date();
  const dateStr = Utilities.formatDate(now, 'GMT+7', 'yyyyMMdd');
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  
  const order = {
    order_id: `ORD-${dateStr}-${random}`,
    quote_id: quote.quote_id,
    customer_name: quote.customer_name,
    phone: quote.phone,
    event_type: quote.event_type,
    event_date: quote.event_date,
    event_time: '',
    location: quote.location,
    guest_count: quote.guest_count,
    menu_items: quote.menu_items,
    total_amount: quote.total,
    deposit: 0,
    remaining: quote.total,
    status: 'confirmed',
    assigned_vendors: [],
    created_at: now.toISOString(),
    notes: quote.notes
  };
  
  // Update quote status
  quote.status = 'accepted';
  updateQuote(quote);
  
  // Create order
  appendRow(SHEET_NAMES.ORDERS, order);
  
  // Create calendar event
  const calendarEvent = {
    event_id: generateId('EVT'),
    order_id: order.order_id,
    title: `${quote.event_type} - ${quote.customer_name}`,
    event_date: quote.event_date,
    start_time: '',
    end_time: '',
    event_type: quote.event_type,
    location: quote.location,
    status: 'confirmed',
    color: ''
  };
  appendRow(SHEET_NAMES.CALENDAR, calendarEvent);
  
  return order;
}

// ==================== ORDER FUNCTIONS ====================

function getOrders(status) {
  let orders = getAllData(SHEET_NAMES.ORDERS);
  
  if (status) {
    orders = orders.filter(o => o.status === status);
  }
  
  return orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

function getOrderById(orderId) {
  const orders = getAllData(SHEET_NAMES.ORDERS);
  return orders.find(o => o.order_id === orderId) || null;
}

function createOrder(order) {
  const now = new Date();
  const dateStr = Utilities.formatDate(now, 'GMT+7', 'yyyyMMdd');
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  
  order.order_id = `ORD-${dateStr}-${random}`;
  order.created_at = now.toISOString();
  order.status = order.status || 'confirmed';
  order.remaining = order.total_amount - (order.deposit || 0);
  
  return appendRow(SHEET_NAMES.ORDERS, order);
}

function updateOrder(order) {
  order.remaining = order.total_amount - (order.deposit || 0);
  return updateRow(SHEET_NAMES.ORDERS, 'order_id', order.order_id, order);
}

function updateOrderStatus(orderId, status) {
  const order = getOrderById(orderId);
  if (!order) {
    return { error: 'Order not found' };
  }
  
  order.status = status;
  return updateOrder(order);
}

// ==================== CALENDAR FUNCTIONS ====================

function getCalendarEvents(year, month, date) {
  let events = getAllData(SHEET_NAMES.CALENDAR);
  
  if (date) {
    events = events.filter(e => e.event_date === date);
  } else if (year && month) {
    const prefix = `${year}-${String(month).padStart(2, '0')}`;
    events = events.filter(e => e.event_date && e.event_date.startsWith(prefix));
  }
  
  return events;
}

function createCalendarEvent(event) {
  event.event_id = generateId('EVT');
  return appendRow(SHEET_NAMES.CALENDAR, event);
}

function updateCalendarEvent(event) {
  return updateRow(SHEET_NAMES.CALENDAR, 'event_id', event.event_id, event);
}

// ==================== VENDOR FUNCTIONS ====================

function getVendors(category) {
  let vendors = getAllData(SHEET_NAMES.VENDORS);
  
  if (category) {
    vendors = vendors.filter(v => v.category === category);
  }
  
  return vendors.filter(v => v.active !== false);
}

function getVendorById(vendorId) {
  const vendors = getAllData(SHEET_NAMES.VENDORS);
  return vendors.find(v => v.vendor_id === vendorId) || null;
}

function createVendor(vendor) {
  vendor.vendor_id = generateId('VND');
  vendor.active = true;
  return appendRow(SHEET_NAMES.VENDORS, vendor);
}

function updateVendor(vendor) {
  return updateRow(SHEET_NAMES.VENDORS, 'vendor_id', vendor.vendor_id, vendor);
}

// ==================== FINANCE FUNCTIONS (SỔ CÁI THU CHI) ====================

function getTransactions(type, orderId, startDate, endDate) {
  let transactions = getAllData(SHEET_NAMES.FINANCE);
  
  if (type) {
    transactions = transactions.filter(t => t.type === type);
  }
  if (orderId) {
    transactions = transactions.filter(t => t.order_id === orderId);
  }
  if (startDate) {
    transactions = transactions.filter(t => t.date >= startDate);
  }
  if (endDate) {
    transactions = transactions.filter(t => t.date <= endDate);
  }
  
  return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function createTransaction(transaction) {
  transaction.transaction_id = generateId('TXN');
  transaction.created_at = new Date().toISOString();
  return appendRow(SHEET_NAMES.FINANCE, transaction);
}

function updateTransaction(transaction) {
  return updateRow(SHEET_NAMES.FINANCE, 'transaction_id', transaction.transaction_id, transaction);
}

function getFinanceSummary(startDate, endDate) {
  let transactions = getAllData(SHEET_NAMES.FINANCE);
  
  if (startDate) {
    transactions = transactions.filter(t => t.date >= startDate);
  }
  if (endDate) {
    transactions = transactions.filter(t => t.date <= endDate);
  }
  
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  
  const byCategory = {};
  transactions.forEach(t => {
    const key = `${t.type}_${t.category}`;
    byCategory[key] = (byCategory[key] || 0) + (Number(t.amount) || 0);
  });
  
  return {
    totalIncome,
    totalExpense,
    profit: totalIncome - totalExpense,
    byCategory
  };
}

// ==================== SETTINGS FUNCTIONS ====================

function getSetting(key) {
  const settings = getAllData(SHEET_NAMES.SETTINGS);
  const setting = settings.find(s => s.key === key);
  return setting ? setting.value : null;
}

function getAllSettings() {
  const settings = getAllData(SHEET_NAMES.SETTINGS);
  const result = {};
  settings.forEach(s => {
    result[s.key] = s.value;
  });
  return result;
}

function setSetting(key, value) {
  const sheet = getSheet(SHEET_NAMES.SETTINGS);
  const rowIndex = findRowIndex(SHEET_NAMES.SETTINGS, 'key', key);
  
  if (rowIndex === -1) {
    appendRow(SHEET_NAMES.SETTINGS, { key, value, description: '' });
  } else {
    sheet.getRange(rowIndex, 2).setValue(value);
  }
  
  return { success: true };
}
