FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY antora-playbook.yml ./antora-playbook.yml
COPY supplemental-ui/ ./supplemental-ui/
COPY lib/ ./lib/

RUN npx antora --fetch antora-playbook.yml

FROM httpd:2.4-alpine AS server
COPY --from=builder /app/build/site /usr/local/apache2/htdocs/
COPY apache.conf /usr/local/apache2/conf/extra/docs-site.conf

RUN sed -i \
        -e 's/#LoadModule rewrite_module/LoadModule rewrite_module/' \
        -e 's/#LoadModule deflate_module/LoadModule deflate_module/' \
        -e 's/#LoadModule headers_module/LoadModule headers_module/' \
        -e 's/#LoadModule expires_module/LoadModule expires_module/' \
        /usr/local/apache2/conf/httpd.conf \
    && printf '\nServerName localhost\nInclude conf/extra/docs-site.conf\n' \
        >> /usr/local/apache2/conf/httpd.conf

EXPOSE 80
CMD ["httpd-foreground"]
