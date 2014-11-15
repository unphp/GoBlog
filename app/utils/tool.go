// @version go-utils 0.1
// @author xiaotangren  <unphp@qq.com>
// @data 2014-07-21
//

package utils

import (
	//"fmt"
	"log"
	"os/exec"
	"path"
	"path/filepath"
	//"strconv"
	"os"
	"runtime"
	"strings"
)

//获取根目录的绝对路径
func RootPath() string {
	var tempSlice []string

	if runtime.GOOS == "windows" {
		//windows系统
		root, _ := exec.LookPath(os.Args[0])
		rootPath, _ := filepath.Abs(root)
		tempSlice = strings.Split(rootPath, `\`)
	} else {
		//其他系统
		root, _ := exec.LookPath(os.Args[0])
		rootPath, _ := filepath.Abs(root)
		tempSlice = strings.Split(rootPath, "/")
	}
	return strings.Join(tempSlice[0:len(tempSlice)-1], "/")
}

func PanicIf(err error) {
	if err != nil {
		log.Println(err.Error())
	}
}

//获得程序执行的根目录
func GetPwd() string {
	pwd, _ := os.Getwd()
	selfdir := path.Dir(pwd)
	return selfdir
}
