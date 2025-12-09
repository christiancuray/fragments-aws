# ==================== TEXT/PLAIN CONVERSIONS ====================

# Create a plain text fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@gmail.com:password123
`This is plain text`

HTTP/1.1 201
[Captures]
plain_id: jsonpath "$.fragment.id"

# Get plain text as text
GET http://localhost:8080/v1/fragments/{{ plain_id }}.txt
[BasicAuth]
user1@gmail.com:password123

HTTP/1.1 200
[Asserts]
header "Content-Type" == "text/plain; charset=utf-8"

# ==================== TEXT/MARKDOWN CONVERSIONS ====================

# Create a markdown fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/markdown
[BasicAuth]
user1@gmail.com:password123
`# Hello World\n\nThis is **bold** text`

HTTP/1.1 201
[Captures]
md_id: jsonpath "$.fragment.id"

# Get markdown as HTML
GET http://localhost:8080/v1/fragments/{{ md_id }}.html
[BasicAuth]
user1@gmail.com:password123

HTTP/1.1 200
[Asserts]
header "Content-Type" == "text/html; charset=utf-8"
body contains "<h1>Hello World</h1>"
body contains "<strong>bold</strong>"

# Get markdown as plain text
GET http://localhost:8080/v1/fragments/{{ md_id }}.txt
[BasicAuth]
user1@gmail.com:password123

HTTP/1.1 200
[Asserts]
header "Content-Type" == "text/plain; charset=utf-8"

# Get markdown as markdown
GET http://localhost:8080/v1/fragments/{{ md_id }}.md
[BasicAuth]
user1@gmail.com:password123

HTTP/1.1 200
[Asserts]
header "Content-Type" contains "text/markdown; charset=utf-8"

# ==================== TEXT/HTML CONVERSIONS ====================

# Create an HTML fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/html
[BasicAuth]
user1@gmail.com:password123
`<h1>Test</h1><p>HTML content</p>`

HTTP/1.1 201
[Captures]
html_id: jsonpath "$.fragment.id"

# Get HTML as HTML
GET http://localhost:8080/v1/fragments/{{ html_id }}.html
[BasicAuth]
user1@gmail.com:password123

HTTP/1.1 200
[Asserts]
header "Content-Type" == "text/html; charset=utf-8"

# Get HTML as plain text
GET http://localhost:8080/v1/fragments/{{ html_id }}.txt
[BasicAuth]
user1@gmail.com:password123

HTTP/1.1 200
[Asserts]
header "Content-Type" == "text/plain; charset=utf-8"

# ==================== APPLICATION/JSON CONVERSIONS ====================

# Create a JSON fragment
POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
user1@gmail.com:password123
`{"name": "John", "age": 30, "hobbies": ["reading", "gaming"]}`

HTTP/1.1 201
[Captures]
json_id: jsonpath "$.fragment.id"

# Get JSON as JSON
GET http://localhost:8080/v1/fragments/{{ json_id }}.json
[BasicAuth]
user1@gmail.com:password123

HTTP/1.1 200
[Asserts]
header "Content-Type" contains "application/json"
jsonpath "$.name" == "John"
jsonpath "$.age" == 30

# Get JSON as YAML
GET http://localhost:8080/v1/fragments/{{ json_id }}.yaml
[BasicAuth]
user1@gmail.com:password123

HTTP/1.1 200
[Asserts]
header "Content-Type" == "application/yaml; charset=utf-8"
body contains "name:"
body contains "John"

# Get JSON as YML
GET http://localhost:8080/v1/fragments/{{ json_id }}.yml
[BasicAuth]
user1@gmail.com:password123

HTTP/1.1 200
[Asserts]
header "Content-Type" == "application/yaml; charset=utf-8"

# Get JSON as plain text
GET http://localhost:8080/v1/fragments/{{ json_id }}.txt
[BasicAuth]
user1@gmail.com:password123

HTTP/1.1 200
[Asserts]
header "Content-Type" == "text/plain; charset=utf-8"

# ==================== TEXT/CSV CONVERSIONS ====================

# Create a CSV fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/csv
[BasicAuth]
user1@gmail.com:password123
`name,age,city\nAlice,28,NYC\nBob,35,LA`

HTTP/1.1 201
[Captures]
csv_id: jsonpath "$.fragment.id"

# Get CSV as CSV
GET http://localhost:8080/v1/fragments/{{ csv_id }}.csv
[BasicAuth]
user1@gmail.com:password123

HTTP/1.1 200
[Asserts]
header "Content-Type" == "text/csv; charset=utf-8"

# Get CSV as JSON
GET http://localhost:8080/v1/fragments/{{ csv_id }}.json
[BasicAuth]
user1@gmail.com:password123

HTTP/1.1 200
[Asserts]
header "Content-Type" contains "application/json"
jsonpath "$[0].name" == "Alice"
jsonpath "$[0].age" == "28"
jsonpath "$[1].name" == "Bob"

# Get CSV as plain text
GET http://localhost:8080/v1/fragments/{{ csv_id }}.txt
[BasicAuth]
user1@gmail.com:password123

HTTP/1.1 200
[Asserts]
header "Content-Type" == "text/plain; charset=utf-8"

# ==================== APPLICATION/YAML CONVERSIONS ====================

# Create a YAML fragment
POST http://localhost:8080/v1/fragments
Content-Type: application/yaml
[BasicAuth]
user1@gmail.com:password123
`name: Alice\nage: 28\ncity: NYC`

HTTP/1.1 201
[Captures]
yaml_id: jsonpath "$.fragment.id"

# Get YAML as YAML
GET http://localhost:8080/v1/fragments/{{ yaml_id }}.yaml
[BasicAuth]
user1@gmail.com:password123

HTTP/1.1 200
[Asserts]
header "Content-Type" == "application/yaml; charset=utf-8"

# Get YAML as YML
GET http://localhost:8080/v1/fragments/{{ yaml_id }}.yml
[BasicAuth]
user1@gmail.com:password123

HTTP/1.1 200
[Asserts]
header "Content-Type" == "application/yaml; charset=utf-8"

# Get YAML as plain text
GET http://localhost:8080/v1/fragments/{{ yaml_id }}.txt
[BasicAuth]
user1@gmail.com:password123

HTTP/1.1 200
[Asserts]
header "Content-Type" == "text/plain; charset=utf-8"

# ==================== IMAGE CONVERSIONS ====================

# Create a PNG fragment
POST http://localhost:8080/v1/fragments
Content-Type: image/png
[BasicAuth]
user1@gmail.com:password123
`This is a PNG image`

HTTP/1.1 201
[Captures]
png_id: jsonpath "$.fragment.id"

# Get PNG as PNG (identity)
GET http://localhost:8080/v1/fragments/{{ png_id }}.png
[BasicAuth]
user1@gmail.com:password123

HTTP/1.1 200
[Asserts]
header "Content-Type" == "image/png"

# Get PNG as JPEG
GET http://localhost:8080/v1/fragments/{{ png_id }}.jpg
[BasicAuth]
user1@gmail.com:password123

HTTP/1.1 200
[Asserts]
header "Content-Type" == "image/jpeg"

# Get PNG as WebP
GET http://localhost:8080/v1/fragments/{{ png_id }}.webp
[BasicAuth]
user1@gmail.com:password123

HTTP/1.1 200
[Asserts]
header "Content-Type" == "image/webp"

# Create a JPEG fragment
POST http://localhost:8080/v1/fragments
Content-Type: image/jpeg
[BasicAuth]
user1@gmail.com:password123
`This is a JPEG image`

HTTP/1.1 201
[Captures]
jpg_id: jsonpath "$.fragment.id"

# Get JPEG as JPEG (identity)
GET http://localhost:8080/v1/fragments/{{ jpg_id }}.jpg
[BasicAuth]
user1@gmail.com:password123

HTTP/1.1 200
[Asserts]
header "Content-Type" == "image/jpeg"

# Get JPEG as PNG
GET http://localhost:8080/v1/fragments/{{ jpg_id }}.png
[BasicAuth]
user1@gmail.com:password123

HTTP/1.1 200
[Asserts]
header "Content-Type" == "image/png"

# Get JPEG as WebP
GET http://localhost:8080/v1/fragments/{{ jpg_id }}.webp
[BasicAuth]
user1@gmail.com:password123

HTTP/1.1 200
[Asserts]
header "Content-Type" == "image/webp"

# Create a WebP fragment
POST http://localhost:8080/v1/fragments
Content-Type: image/webp
[BasicAuth]
user1@gmail.com:password123
`This is a WebP image`

HTTP/1.1 201
[Captures]
webp_id: jsonpath "$.fragment.id"

# Get WebP as WebP (identity)
GET http://localhost:8080/v1/fragments/{{ webp_id }}.webp
[BasicAuth]
user1@gmail.com:password123

HTTP/1.1 200
[Asserts]
header "Content-Type" == "image/webp"

# Get WebP as PNG
GET http://localhost:8080/v1/fragments/{{ webp_id }}.png
[BasicAuth]
user1@gmail.com:password123

HTTP/1.1 200
[Asserts]
header "Content-Type" == "image/png"

# Create a GIF fragment
POST http://localhost:8080/v1/fragments
Content-Type: image/gif
[BasicAuth]
user1@gmail.com:password123
`This is a GIF image`

HTTP/1.1 201
[Captures]
gif_id: jsonpath "$.fragment.id"

# Get GIF as GIF (identity)
GET http://localhost:8080/v1/fragments/{{ gif_id }}.gif
[BasicAuth]
user1@gmail.com:password123

HTTP/1.1 200
[Asserts]
header "Content-Type" == "image/gif"

# Get GIF as PNG
GET http://localhost:8080/v1/fragments/{{ gif_id }}.png
[BasicAuth]
user1@gmail.com:password123

HTTP/1.1 200
[Asserts]
header "Content-Type" == "image/png"

# Create an AVIF fragment
POST http://localhost:8080/v1/fragments
Content-Type: image/avif
[BasicAuth]
user1@gmail.com:password123
`This is an AVIF image`

HTTP/1.1 201
[Captures]
avif_id: jsonpath "$.fragment.id"

# Get AVIF as AVIF (identity)
GET http://localhost:8080/v1/fragments/{{ avif_id }}.avif
[BasicAuth]
user1@gmail.com:password123

HTTP/1.1 200
[Asserts]
header "Content-Type" == "image/avif"

# Get AVIF as PNG
GET http://localhost:8080/v1/fragments/{{ avif_id }}.png
[BasicAuth]
user1@gmail.com:password123

HTTP/1.1 200
[Asserts]
header "Content-Type" == "image/png"

# ==================== ERROR CASES ====================

# Try to get with unsupported extension (should return 415)
GET http://localhost:8080/v1/fragments/{{ plain_id }}.pdf
[BasicAuth]
user1@gmail.com:password123

HTTP/1.1 415
[Asserts]
jsonpath "$.error.code" == 415

# Try to get non-existent fragment
GET http://localhost:8080/v1/fragments/non-existent-id.txt
[BasicAuth]
user1@gmail.com:password123

HTTP/1.1 404
[Asserts]
jsonpath "$.error.code" == 404
