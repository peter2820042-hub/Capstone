# Database Tables - Sentrina

## 1. admins
| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| username | VARCHAR(100) | UNIQUE NOT NULL |
| password_hash | VARCHAR(255) | |
| full_name | VARCHAR(255) | |
| email | VARCHAR(255) | |
| phone | VARCHAR(50) | |
| position | VARCHAR(100) | |
| profile_image | TEXT | |
| status | VARCHAR(50) | DEFAULT 'active' |
| last_login | TIMESTAMP | |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

## 2. staffs
| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| username | VARCHAR(100) | UNIQUE NOT NULL |
| password_hash | VARCHAR(255) | |
| full_name | VARCHAR(255) | |
| email | VARCHAR(255) | |
| phone | VARCHAR(50) | |
| position | VARCHAR(100) | |
| profile_image | TEXT | |
| status | VARCHAR(50) | DEFAULT 'active' |
| last_login | TIMESTAMP | |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

## 3. residents
| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| username | VARCHAR(100) | UNIQUE NOT NULL |
| password_hash | VARCHAR(255) | |
| full_name | VARCHAR(255) | |
| lot_number | VARCHAR(50) | |
| block | VARCHAR(50) | |
| phase | VARCHAR(50) | |
| email | VARCHAR(255) | |
| phone | VARCHAR(50) | |
| profile_image | TEXT | |
| role | VARCHAR(50) | DEFAULT 'homeowner' |
| status | VARCHAR(50) | DEFAULT 'active' |
| date_registered | DATE | DEFAULT CURRENT_DATE |
| last_login | TIMESTAMP | |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

## 4. violations
| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| resident_id | INTEGER | REFERENCES residents(id) |
| resident_name | VARCHAR(255) | |
| violation_type | VARCHAR(100) | |
| description | TEXT | |
| date_issued | DATE | DEFAULT CURRENT_DATE |
| status | VARCHAR(50) | DEFAULT 'pending' |
| penalty | DECIMAL(10,2) | |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

## 5. bills
| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| resident_id | INTEGER | REFERENCES residents(id) |
| resident_name | VARCHAR(255) | |
| bill_type | VARCHAR(100) | |
| bill_reference | VARCHAR(100) | |
| billing_period | VARCHAR(100) | |
| amount | DECIMAL(10,2) | NOT NULL |
| due_date | DATE | |
| status | VARCHAR(50) | DEFAULT 'unpaid' |
| date_paid | DATE | |
| payment_method | VARCHAR(50) | |
| amount_paid | DECIMAL(10,2) | |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

## 6. payments
| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| resident_id | INTEGER | REFERENCES residents(id) |
| resident_name | VARCHAR(255) | |
| bill_reference | VARCHAR(100) | |
| amount | DECIMAL(10,2) | NOT NULL |
| payment_date | DATE | DEFAULT CURRENT_DATE |
| payment_method | VARCHAR(50) | |
| status | VARCHAR(50) | DEFAULT 'pending' |
| approved_date | DATE | |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

## 7. audit_logs
| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| user_name | VARCHAR(255) | |
| user_role | VARCHAR(50) | |
| action | VARCHAR(100) | |
| module | VARCHAR(100) | |
| description | TEXT | |
| ip_address | VARCHAR(50) | |
| profile_image | TEXT | |
| status | VARCHAR(50) | DEFAULT 'success' |
| timestamp | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

## 8. notifications
| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| user_id | INTEGER | REFERENCES residents(id) |
| title | VARCHAR(255) | |
| message | TEXT | |
| type | VARCHAR(50) | DEFAULT 'info' |
| is_read | BOOLEAN | DEFAULT FALSE |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

---

# Database Indexes

## residents table
- idx_residents_lot_number ON residents(lot_number)
- idx_residents_block ON residents(block)
- idx_residents_status ON residents(status)
- idx_residents_username ON residents(username)

## violations table
- idx_violations_lot_number ON violations(lot_number)
- idx_violations_status ON violations(status)
- idx_violations_date_issued ON violations(date_issued)

## bills table
- idx_bills_lot_number ON bills(lot_number)
- idx_bills_status ON bills(status)
- idx_bills_due_date ON bills(due_date)

## payments table
- idx_payments_lot_number ON payments(lot_number)
- idx_payments_status ON payments(status)
- idx_payments_payment_date ON payments(payment_date)

## audit_logs table
- idx_audit_logs_user_name ON audit_logs(user_name)
- idx_audit_logs_user_role ON audit_logs(user_role)
- idx_audit_logs_timestamp ON audit_logs(timestamp)

## notifications table
- idx_notifications_user_id ON notifications(user_id)
- idx_notifications_status ON notifications(status)
