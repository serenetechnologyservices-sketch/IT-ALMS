package db

import (
	"database/sql"
	"encoding/json"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

var DB *sql.DB

func Init(path string) error {
	var err error
	DB, err = sql.Open("sqlite3", path+"?_journal_mode=WAL")
	if err != nil {
		return err
	}

	schema := `
	CREATE TABLE IF NOT EXISTS system_data (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		payload TEXT NOT NULL,
		collected_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);
	CREATE TABLE IF NOT EXISTS software_data (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		payload TEXT NOT NULL,
		collected_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);
	CREATE TABLE IF NOT EXISTS performance_data (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		payload TEXT NOT NULL,
		collected_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);
	CREATE TABLE IF NOT EXISTS compliance_data (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		payload TEXT NOT NULL,
		collected_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);
	CREATE TABLE IF NOT EXISTS sync_queue (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		data_type TEXT NOT NULL,
		payload TEXT NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		synced INTEGER DEFAULT 0
	);`

	_, err = DB.Exec(schema)
	return err
}

func StoreAndQueue(table, dataType string, data interface{}) error {
	payload, err := json.Marshal(data)
	if err != nil {
		return err
	}
	p := string(payload)

	tx, err := DB.Begin()
	if err != nil {
		return err
	}

	_, err = tx.Exec("INSERT INTO "+table+" (payload) VALUES (?)", p)
	if err != nil {
		tx.Rollback()
		return err
	}

	_, err = tx.Exec("INSERT INTO sync_queue (data_type, payload) VALUES (?, ?)", dataType, p)
	if err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit()
}

func GetUnsyncedRecords(limit int) ([]struct {
	ID       int64
	DataType string
	Payload  string
}, error) {
	rows, err := DB.Query("SELECT id, data_type, payload FROM sync_queue WHERE synced = 0 ORDER BY id ASC LIMIT ?", limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var records []struct {
		ID       int64
		DataType string
		Payload  string
	}
	for rows.Next() {
		var r struct {
			ID       int64
			DataType string
			Payload  string
		}
		if err := rows.Scan(&r.ID, &r.DataType, &r.Payload); err != nil {
			continue
		}
		records = append(records, r)
	}
	return records, nil
}

func MarkSynced(id int64) error {
	_, err := DB.Exec("UPDATE sync_queue SET synced = 1 WHERE id = ?", id)
	return err
}

func GetLastCollectionTime(table string) (time.Time, error) {
	var t string
	err := DB.QueryRow("SELECT collected_at FROM " + table + " ORDER BY id DESC LIMIT 1").Scan(&t)
	if err != nil {
		return time.Time{}, err
	}
	return time.Parse("2006-01-02 15:04:05", t)
}
