# Build the WebAssembly port of the API (spotapi.cc) used by the
# client-only build of the application (see README).
#
# SPOT_PREFIX must point to an installation of Spot compiled with
# Emscripten, e.g., the artifact of Spot's "emscripten" CI job, or
#
#   emconfigure ./configure --host=wasm32-unknown-emscripten \
#     --disable-shared --disable-python --prefix=$SPOT_PREFIX \
#     CFLAGS='-O2 -fwasm-exceptions' CXXFLAGS='-O2 -fwasm-exceptions' \
#     LDFLAGS=-fwasm-exceptions \
#     --disable-debug gl_cv_func_sleep_works=yes
#   for d in cadical buddy lib ltdl spot; do emmake make -C $d; done
#   emmake make -C buddy install
#   emmake make -C spot install
#
# The output goes to client/public/wasm/, where the worker loads it from.

SPOT_PREFIX ?= /usr/local
EMXX ?= em++
OUT = ../client/public/wasm

# Spot reports errors with exceptions, so they must work.  Spot's
# algorithms recurse deeply on large automata, hence the large stack.
CXXFLAGS = -O2 -std=c++20 -fwasm-exceptions
LDFLAGS = -fwasm-exceptions \
  -sMODULARIZE -sEXPORT_ES6 -sENVIRONMENT=web,worker,node \
  -sALLOW_MEMORY_GROWTH -sSTACK_SIZE=8MB \
  -sEXPORTED_FUNCTIONS=_spotapi \
  -sEXPORTED_RUNTIME_METHODS=cwrap

all: $(OUT)/spotapi.mjs

$(OUT)/spotapi.mjs: spotapi.cc
	mkdir -p $(OUT)
	$(EMXX) $(CXXFLAGS) -I$(SPOT_PREFIX)/include $< \
	  -L$(SPOT_PREFIX)/lib -lspot -lbddx $(LDFLAGS) -o $@

# The same code, compiled natively against a regular installation of
# Spot, to try it from the command line: ./spotapi-native '/api/study/GFa'
spotapi-native: spotapi.cc
	$(CXX) -O2 -std=c++20 -DSPOTAPI_MAIN $< -lspot -lbddx -o $@

clean:
	rm -f $(OUT)/spotapi.mjs $(OUT)/spotapi.wasm spotapi-native

.PHONY: all clean
