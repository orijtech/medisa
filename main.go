// Copyright 2017 orijtech. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package main

import (
	"bytes"
	"flag"
	"html/template"
	"log"
	"math/rand"
	"net/http"
	"path/filepath"

	"golang.org/x/crypto/acme/autocert"

	"github.com/orijtech/otils"

	"github.com/odeke-em/utils"
)

type WSSetup struct {
	WSURL   string
	AuthURL string

	InitialSearchKeyword string
}

var http1 = false

func searchInit(rw http.ResponseWriter, req *http.Request) {
	wss := &WSSetup{
		WSURL:   "wss://rsp.orijtech.com/init",
		AuthURL: "https://rsp.orijtech.com/auth",

		InitialSearchKeyword: randomInitialSearchKeyword(),
	}

	indexTmpl, err := template.New("index.html").Funcs(template.FuncMap{
		"jsonCacheInvalidatorKey": rand.Float32,
	}).ParseFiles("static/index.html")
	if err != nil {
		http.Error(rw, err.Error(), http.StatusInternalServerError)
		return
	}

	outBuf := new(bytes.Buffer)
	if err := indexTmpl.Execute(outBuf, wss); err != nil {
		http.Error(rw, err.Error(), http.StatusInternalServerError)
		return
	}

	rw.Write(outBuf.Bytes())
	log.Printf("Sent page to %v\n", req.RemoteAddr)
}

func main() {
	var staticDirLocalpath string
	var hostname string
	flag.BoolVar(&http1, "http1", false, "whether to serve in http1 mode")
	flag.StringVar(&hostname, "host", "localhost", "the host of the site")
	flag.StringVar(&staticDirLocalpath, "static-dir", "./static", "the static directory")
	flag.Parse()

	staticDirAbspath, err := filepath.Abs(staticDirLocalpath)
	if err != nil {
		log.Fatal(err)
	}

	http.Handle("/", http.FileServer(http.Dir(staticDirAbspath)))
	http.HandleFunc("/search", searchInit)
	mux := http.DefaultServeMux

	if http1 {
		addr := utils.ParsePortFromEnv("MEDISA_PORT", "9334")
		log.Printf("http1 running on address: %s", addr)
		log.Fatal(http.ListenAndServe(addr, mux))
		return
	}

	// Redirecting non-https traffic
	go func() {
		nonHTTPSAddr := utils.ParsePortFromEnv("MEDISA_NON_HTTPS_PORT", ":80")
		nonHTTPSHandler := otils.RedirectAllTrafficTo("https://medisa.orijtech.com")
		err := http.ListenAndServe(nonHTTPSAddr, nonHTTPSHandler)
		if err != nil {
			log.Printf("http-redirector: failed to bind the redirector: %v", err)
		}
	}()

	domains := []string{
		"medisa.orijtech.com", "www.medisa.orijtech.com",
		"search.orijtech.com", "www.search.orijtech.com",
	}

	log.Printf("Running in http2 mode")
	log.Fatal(http.Serve(autocert.NewListener(domains...), mux))
}

var initialSearchKeywords = []string{
	"news",
	"latest",
	"blockbusters",
	"series",
	"cats",
	"goats",
	"boats",
	"inspiration",
	"trending",
	"boomin",
	"media",
	"breaking news",
	"latest music",
	"latest movies",
	"internet memes",
	"sports",
	"culture",
	"conspiracy",
	"apps",
	"weather",
	"politics",
	"innovations",
	"sensationalism",
}

func randomInitialSearchKeyword() string {
	i := rand.Intn(len(initialSearchKeywords))
	return initialSearchKeywords[i]
}
