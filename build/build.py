#/usr/bin/python

TAG = '%%'

result = '%s gadget.xml %s'%(TAG, TAG)
while (True):
    start = result.find(TAG)
    if start == -1:
        break
    end = result.find(TAG, start + 1)
    file_name = result[start + len(TAG):end].strip()
    file_body = open(file_name).read()
    result = result[0:start] + file_body + result[end + len(TAG):]

with open('build/gadget.xml', 'w') as output:
    output.write(result)
