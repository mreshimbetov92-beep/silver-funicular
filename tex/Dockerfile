FROM debian:bookworm-slim
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends texlive-full python3 fonts-dejavu-core && rm -rf /var/lib/apt/lists/*
# Prebuild caches; compile jobs have no network and a read-only root.
RUN fmtutil-sys --all && fc-cache -f && luaotfload-tool --update
COPY compile.py /opt/idrok/compile.py
USER 65534:65534
WORKDIR /work
ENTRYPOINT ["python3", "-I", "/opt/idrok/compile.py"]
