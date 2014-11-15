// init
package handler

// 批量定义全局变量
var (
	readerDataSet []func(data map[string]interface{})
)

func init() {
	readerDataSet = make([]func(data map[string]interface{}), 0)
}

func RegisterReaderDataSet(f func(data map[string]interface{})) {
	readerDataSet = append(readerDataSet, f)
}
