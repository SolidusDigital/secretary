# docker image prune -af
# docker build --rm=true --tag=scrapper scrapperBackEnd --cgroup-parent ScrapperEngine 
# docker build --rm=true --tag=scrapper scrapperWorker --cgroup-parent ScrapperEngine
# docker build --rm=true --tag=scrapper proxyservice --cgroup-parent ScrapperEngine
# --no-cache	
docker compose up --force-recreate --build --scale scrapper=50