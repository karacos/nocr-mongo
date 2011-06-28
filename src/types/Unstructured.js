/* 
* 3.7.13.1 nt:unstructured
		[nt:unstructured] orderable
			- * (UNDEFINED) multiple
			- * (UNDEFINED)
			+ * (nt:base) = nt:unstructured sns VERSION

				 */

Unstructured = {
		applyType: function(node){
			if (node.data['jcr:primaryType'] === undefined || node.data['jcr:primaryType'] === null ) {
				data['jcr:primaryType'] = 'nt:unstructured';
			}
		}
};

modules.exports = Unstructured;