sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
  ],
  function (Controller, JSONModel, Filter, FilterOperator, MessageToast) {
    "use strict";

    return Controller.extend("erpadvancedmovementproject.controller.Movement", {
      onInit: function () {
        this.uri = "/MovementSet";
        this._items = [];

        var oItemsModel = new JSONModel({ items: [] });
        this.getView().setModel(oItemsModel, "itemsModel");
      },

      onFilterChange: function () {
        var oTypeSelect = this.byId("filterTypeSelect");
        var sType = oTypeSelect.getSelectedKey();
        var oDatePicker = this.byId("dateFilter");
        var sDate = oDatePicker.getDateValue();

        var aFilters = [];
        if (sType) {
          aFilters.push(new Filter("Type", FilterOperator.EQ, sType));
        }
        if (sDate) {
          aFilters.push(new Filter("MovDate", FilterOperator.EQ, sDate));
        }

        var oList = this.byId("entryList");
        var oBinding = oList.getBinding("items");
        oBinding.filter(aFilters);
      },

      onSelectionChange: function (oEvent) {
        var oList = oEvent.getSource();
        var oSelectedItem = oList.getSelectedItem();

        if (oSelectedItem) {
          var oBindingContext = oSelectedItem.getBindingContext();
          var sMovId = oBindingContext.getProperty("Id");
          this._showDetail(oBindingContext, sMovId);
        } else {
          this._clearDetail();
        }
      },

      _showDetail: function (oBindingContext, sMovId) {
        var oDetailPage = this.byId("detailPage");
        oDetailPage.setBindingContext(oBindingContext);
        this.byId("splitApp").toDetail(oDetailPage);

        var oItemsList = this.byId("itemsListDetail");
        var aFilters = [new Filter("MovId", FilterOperator.EQ, sMovId)];
        var oBinding = oItemsList.getBinding("items");
        oBinding.filter(aFilters);

        var oItemsModel = new JSONModel({ items: this._items });
        this.getView().setModel(oItemsModel, "itemsModel");
      },

      _clearDetail: function () {
        var oDetailPage = this.byId("detailPage");
        oDetailPage.unbindElement();
        this.byId("splitApp").toDetail(oDetailPage);

        var oItemsList = this.byId("itemsListDetail");
        var oBinding = oItemsList.getBinding("items");
        oBinding.filter([]);
      },

      onSaveDetails: function () {
        var oModel = this.getView().getModel();
        var oDetailPage = this.byId("detailPage");
        var oContext = oDetailPage.getBindingContext();

        var oData = oContext.getObject();
        oModel.update(oContext.getPath(), oData, {
          success: function () {
            MessageToast.show("Details updated successfully");
          },
          error: function () {
            MessageToast.show("Error updating details");
          },
        });
      },

      onOpenCreateMovementDialog: function () {
        if (!this._createMovementDialog) {
          this._createMovementDialog = this.byId("createMovementDialog");
        }
        this._createMovementDialog.open();
      },

      onCloseCreateMovementDialog: function () {
        if (this._createMovementDialog) {
          this._createMovementDialog.close();
        }
      },

      onCreateMovement: function () {
        var sId = this.byId("idInput").getValue();
        var sType = this.byId("typeSelect").getSelectedKey();
        var sDate = this.byId("datePicker").getDateValue();
        var sPartner = this.byId("partnerInput").getValue();
        var sLocation = this.byId("locationSelect").getSelectedKey();
        var bFinished = this.byId("finishedCheckBox").getSelected();

        // Ensure date is in correct format
        var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
          pattern: "yyyy-MM-dd'T'HH:mm:ss",
        });
        var formattedDate = oDateFormat.format(sDate);

        // Get the current date and time
        var currentDate = new Date();
        var formattedCurrentDate = oDateFormat.format(currentDate);

        // Get the current user
        var sUser = sap.ushell.Container.getUser().getId();

        var newMovement = {
          Id: sId,
          Type: sType,
          MovDate: formattedDate,
          ChgDate: formattedCurrentDate,
          ChgUser: sUser, // Current user for creation
          Partner: sPartner,
          Location: sLocation,
          Finished: bFinished,
        };

        var oModel = this.getView().getModel();

        oModel.create("/MovementSet", newMovement, {
          success: function () {
            MessageToast.show("New movement created successfully");
            this.onCloseCreateMovementDialog();
          }.bind(this),
          error: function () {
            MessageToast.show("Error creating new movement");
          },
        });
      },

      onOpenEditMovementDialog: function () {
        var oDetailPage = this.byId("detailPage");
        var oContext = oDetailPage.getBindingContext();
        if (oContext) {
          var oData = oContext.getObject();

          this.byId("editIdInput").setValue(oData.Id);
          this.byId("editTypeSelect").setSelectedKey(oData.Type);
          this.byId("editDatePicker").setDateValue(new Date(oData.MovDate));
          this.byId("editPartnerInput").setValue(oData.Partner);
          this.byId("editLocationSelect").setSelectedKey(oData.Location);
          this.byId("editFinishedCheckBox").setSelected(oData.Finished);

          if (!this._editMovementDialog) {
            this._editMovementDialog = this.byId("editMovementDialog");
          }
          this._editMovementDialog.open();
        }
      },

      onCloseEditMovementDialog: function () {
        if (this._editMovementDialog) {
          this._editMovementDialog.close();
        }
      },

      onSaveEditedMovement: function () {
        var oModel = this.getView().getModel();

        var sId = this.byId("editIdInput").getValue();
        var sType = this.byId("editTypeSelect").getSelectedKey();
        var sDate = this.byId("editDatePicker").getDateValue();
        var sPartner = this.byId("editPartnerInput").getValue();
        var sLocation = this.byId("editLocationSelect").getSelectedKey();
        var bFinished = this.byId("editFinishedCheckBox").getSelected();

        // Get the current date and time
        var currentDate = new Date();
        var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
          pattern: "yyyy-MM-dd'T'HH:mm:ss",
        });
        var formattedCurrentDate = oDateFormat.format(currentDate);

        // Get the current user
        var sUser = sap.ushell.Container.getUser().getId();

        var oUpdatedData = {
          Id: sId,
          Type: sType,
          MovDate: formattedCurrentDate,
          ChgDate: formattedCurrentDate,
          ChgUser: sUser, // Current user for update
          Partner: sPartner,
          Location: sLocation,
          Finished: bFinished,
        };

        oModel.update("/MovementSet('" + sId + "')", oUpdatedData, {
          success: function () {
            MessageToast.show("Movement updated successfully");
            this.onCloseEditMovementDialog();
          }.bind(this),
          error: function () {
            MessageToast.show("Error updating movement");
          },
        });
      },

      onOpenConfirmDeleteDialog: function () {
        if (!this._confirmDeleteDialog) {
          this._confirmDeleteDialog = this.byId("confirmDeleteDialog");
        }
        this._confirmDeleteDialog.open();
      },

      onCloseConfirmDeleteDialog: function () {
        if (this._confirmDeleteDialog) {
          this._confirmDeleteDialog.close();
        }
      },

      onConfirmDelete: function () {
        var oModel = this.getView().getModel();
        var oDetailPage = this.byId("detailPage");
        var oContext = oDetailPage.getBindingContext();
        var sId = oContext.getProperty("Id");

        oModel.remove("/MovementSet('" + sId + "')", {
          success: function () {
            MessageToast.show("Movement deleted successfully");
            this.onCloseConfirmDeleteDialog();
            this._clearDetail();
          }.bind(this),
          error: function () {
            MessageToast.show("Error deleting movement");
          },
        });
      },

      onOpenAddItemDialog: function () {
        var oDetailPage = this.byId("detailPage");
        var oContext = oDetailPage.getBindingContext();
        if (oContext) {
          var sMovId = oContext.getProperty("Id");
          this.byId("itemMovIdInput").setValue(sMovId);
          if (!this._addItemDialog) {
            this._addItemDialog = this.byId("addItemDialog");
          }
          this._addItemDialog.open();
        }
      },

      onCloseAddItemDialog: function () {
        if (this._addItemDialog) {
          this._addItemDialog.close();
        }
      },

      onCreateItem: function () {
        var sMovId = this.byId("itemMovIdInput").getValue();
        var sItemId = this.byId("itemItemIdInput").getValue();
        var sMatnr = this.byId("itemMatnrInput").getValue();
        var sUmziz = this.byId("itemUmzizInput").getValue();
        var sMeins = this.byId("itemMeinsInput").getValue();

        var newItem = {
          MovId: sMovId,
          ItemId: sItemId,
          Matnr: sMatnr,
          Umziz: sUmziz,
          Meins: sMeins,
        };

        var oModel = this.getView().getModel();

        oModel.create("/MovementItemSet", newItem, {
          success: function () {
            MessageToast.show("New item added successfully");
            this.onCloseAddItemDialog();
          }.bind(this),
          error: function () {
            MessageToast.show("Error adding new item");
          },
        });
      },
    });
  }
);
