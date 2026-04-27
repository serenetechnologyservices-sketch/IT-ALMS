package logger

import (
	"encoding/json"
	"fmt"
	"os"
	"sync"
	"time"
)

type Logger struct {
	file *os.File
	mu   sync.Mutex
}

type LogEntry struct {
	Timestamp string `json:"timestamp"`
	Level     string `json:"level"`
	Message   string `json:"message"`
	Module    string `json:"module,omitempty"`
	Error     string `json:"error,omitempty"`
}

var instance *Logger

func Init(path string) error {
	f, err := os.OpenFile(path, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return err
	}
	instance = &Logger{file: f}
	return nil
}

func log(level, module, msg string, errStr string) {
	entry := LogEntry{
		Timestamp: time.Now().UTC().Format(time.RFC3339),
		Level:     level,
		Message:   msg,
		Module:    module,
		Error:     errStr,
	}
	data, _ := json.Marshal(entry)
	line := string(data) + "\n"

	fmt.Print(line)
	if instance != nil {
		instance.mu.Lock()
		instance.file.WriteString(line)
		instance.mu.Unlock()
	}
}

func Info(module, msg string)              { log("INFO", module, msg, "") }
func Warn(module, msg string)              { log("WARN", module, msg, "") }
func Error(module, msg string, err error)  { e := ""; if err != nil { e = err.Error() }; log("ERROR", module, msg, e) }
